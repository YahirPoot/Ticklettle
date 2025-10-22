import { inject, Injectable } from '@angular/core';
import { UserStoreService } from './user-store.service';
import { AuthUser, UserRole } from '../interfaces';

interface VerifyResponse {
  isNew: boolean;
  user?: AuthUser;
  tempUser?: { email: string; googleId: string; name: string; picture: string; };
}

interface RegisterResponse {
  user: AuthUser;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private storeService = inject(UserStoreService);

  async verifyGoogleToken(email: string, googleId: string, name: string, picture: string): Promise<VerifyResponse> {
    await this.delay(500);

    const existing = this.storeService.findByEmail(email);

    if (existing && existing.isRegistered) {
      return {
        isNew: false,
        user: existing
      };
    }

    return {
      isNew: true,
      tempUser: { email, googleId, name, picture }
    };
  }

  async completeRegistration(email: string, googleId: string, name: string, picture: string, role: UserRole): Promise<RegisterResponse> {
    await this.delay(500);

    const user: AuthUser = {
      id: googleId, 
      email, 
      name, 
      picture,
      roles: [role],
      isRegistered: true
    };

    this.storeService.upsert(user);

    return {
      user, 
      token: this.generateMockToken(user)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockToken(user: AuthUser): string {
    return btoa(JSON.stringify({ uid: user.id, email: user.email, roles: user.roles }));
  }

}
