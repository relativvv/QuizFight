import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {RouterModule, Routes} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/misc/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import { NoPermissionComponent } from './components/misc/no-permission/no-permission.component';
import { WaitingComponent } from './components/game/waiting/waiting.component';
import { QuestionComponent } from './components/game/question/question.component';
import { ResultComponent } from './components/game/result/result.component';
import {HttpClientModule} from '@angular/common/http';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {TranslateHtmlCodesPipe} from '../../pipes/translateHtmlCodes.pipe';
import { QueueComponent } from './components/game/queue/queue.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AdminComponent } from './components/admin/admin.component';
import {MatTabsModule} from '@angular/material/tabs';
import { UserEditModalComponent } from './components/modals/user-edit-modal/user-edit-modal.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {ToastrModule} from 'ngx-toastr';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
   path: 'register',
   component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'userdetails',
    component: UserDetailsComponent
  },
  {
    path: 'queue',
    component: QueueComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    NoPermissionComponent,
    WaitingComponent,
    QuestionComponent,
    ResultComponent,
    UserDetailsComponent,
    TranslateHtmlCodesPipe,
    QueueComponent,
    AdminComponent,
    UserEditModalComponent
  ],
  imports: [
    ToastrModule.forRoot(),
    RouterModule.forRoot(routes),
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    MatSidenavModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule,
    MatBadgeModule,
    HttpClientModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSlideToggleModule,
  ],
  entryComponents: [
    UserEditModalComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
