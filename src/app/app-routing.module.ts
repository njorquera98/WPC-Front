import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FixtureComponent } from './fixture/fixture.component';
import { AmericanoComponent } from './americano/americano.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'fixture', component: FixtureComponent },
  { path: 'americano', component: AmericanoComponent },
  { path: '', redirectTo: '/fixture', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
