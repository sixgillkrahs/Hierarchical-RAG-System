import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Version,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { CurrentUser } from '../../../common/auth/decorators/current-user.decorator';
import { Public } from '../../../common/auth/decorators/public.decorator';
import type { AuthenticatedUser } from '../../../common/auth/interfaces/authenticated-user.interface';
import { AuthTokenService } from '../../auth-token.service';
import {
  getAuthCookieName,
  getAuthCookieOptions,
  getRefreshCookieName,
  getRefreshCookieOptions,
} from '../../auth-cookie.util';
import { LoginCommand } from '../../application/commands/login.command';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user.query';
import type { AuthProfile } from '../../domain/auth-profile';
import { LoginDto } from '../../dto/login.dto';

type LoginExecutionResult = {
  message: string;
  refreshToken: string;
  success: boolean;
  token: string;
  user: AuthProfile;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Public()
  @Post('login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({
    description: 'Sets the HttpOnly auth cookie and returns the current user profile.',
  })
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute<LoginCommand, LoginExecutionResult>(
      new LoginCommand(payload.email, payload.password),
    );

    response.cookie(
      getAuthCookieName(this.configService),
      result.token,
      getAuthCookieOptions(this.configService),
    );
    response.cookie(
      getRefreshCookieName(this.configService),
      result.refreshToken,
      getRefreshCookieOptions(this.configService),
    );

    return {
      success: result.success,
      message: result.message,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh-token')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh cookies from the refresh token' })
  @ApiOkResponse({
    description: 'Refreshes the session cookies and returns the current user profile.',
  })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshCookieName = getRefreshCookieName(this.configService);
    const refreshToken = request.cookies?.[refreshCookieName];

    if (typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const payload = await this.authTokenService.verifyRefreshToken(refreshToken);
    const user = await this.queryBus.execute<GetCurrentUserQuery, AuthProfile>(
      new GetCurrentUserQuery(payload.sub),
    );
    const tokens = await this.authTokenService.createTokenPair(user);

    response.cookie(
      getAuthCookieName(this.configService),
      tokens.accessToken,
      getAuthCookieOptions(this.configService),
    );
    response.cookie(
      getRefreshCookieName(this.configService),
      tokens.refreshToken,
      getRefreshCookieOptions(this.configService),
    );

    return {
      success: true,
      message: 'Token refreshed successfully.',
      user,
    };
  }

  @Public()
  @Post('logout')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear the HttpOnly auth cookie' })
  @ApiOkResponse({
    description: 'Logs the browser session out by clearing the auth cookie.',
  })
  logout(@Res({ passthrough: true }) response: Response) {
    const { maxAge, ...cookieOptions } = getAuthCookieOptions(this.configService);
    void maxAge;
    const { maxAge: refreshMaxAge, ...refreshCookieOptions } =
      getRefreshCookieOptions(this.configService);
    void refreshMaxAge;

    response.clearCookie(getAuthCookieName(this.configService), cookieOptions);
    response.clearCookie(
      getRefreshCookieName(this.configService),
      refreshCookieOptions,
    );

    return {
      success: true,
      message: 'Logout successful.',
    };
  }

  @Get('me')
  @Version('1')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Return the authenticated user profile' })
  @ApiOkResponse({
    description: 'Current user profile derived from the access token.',
  })
  me(@CurrentUser() user: AuthenticatedUser | undefined) {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    return this.queryBus.execute<GetCurrentUserQuery, AuthProfile>(
      new GetCurrentUserQuery(user.userId),
    );
  }
}
