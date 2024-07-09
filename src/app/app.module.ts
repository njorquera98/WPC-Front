import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FixtureComponent } from './fixture/fixture.component';
import { FormsModule } from '@angular/forms';
import { AmericanoComponent } from './americano/americano.component';
import { FixtureAmericanoService } from './fixture-americano.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FixtureComponent,
    AmericanoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [FixtureAmericanoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
