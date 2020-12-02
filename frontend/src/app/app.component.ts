import {AfterViewInit, Component, ElementRef} from '@angular/core';
import {Router, RouterEvent, RouteConfigLoadEnd, RouteConfigLoadStart} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from "./components/register/register.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  title = 'frontend';
  loading: boolean;

  constructor(private readonly elementRef: ElementRef, private readonly router: Router, private readonly modalService: NgbModal) {
    this.loading = false;

    router.events.subscribe((event: RouterEvent) => {
      if (event instanceof RouteConfigLoadStart) {
        this.loading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loading = false;
      }
    });
  }

  openLogin(): void {
    this.modalService.open(LoginComponent);
  }

  openRegister(): void {
    this.modalService.open(RegisterComponent);
  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.ownerDocument.body.style.background = '#3e3e3e';
  }
}
