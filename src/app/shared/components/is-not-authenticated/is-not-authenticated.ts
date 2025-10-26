import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'is-not-authenticated',
  imports: [RouterLink, MatIconModule],
  templateUrl: './is-not-authenticated.html',
})
export class IsNotAuthenticated {
  message = input<string>('');
}
