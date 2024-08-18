import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FixtureComponent } from './fixture/fixture.component';
import { FormsModule } from '@angular/forms';
import { AmericanoComponent } from './americano/americano.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AmericanoService } from './services/americano.service';
import { ParejaService } from './services/pareja.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FixtureComponent,
    AmericanoComponent,
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgbModule],
  providers: [AmericanoService, ParejaService, provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
