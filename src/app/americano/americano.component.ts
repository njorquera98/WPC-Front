import { Component, OnInit } from '@angular/core';
import { FixtureAmericanoService } from '../fixture-americano.service';

@Component({
  selector: 'app-americano',
  templateUrl: './americano.component.html',
  styleUrl: './americano.component.css'
})
export class AmericanoComponent implements OnInit {
  grupos: any[] = [];

  constructor(private torneoService: FixtureAmericanoService) { }

  ngOnInit(): void {
    this.grupos = this.torneoService.getGrupos();
  }
}
