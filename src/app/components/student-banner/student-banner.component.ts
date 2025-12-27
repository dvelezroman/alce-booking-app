import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResourceI } from '../../services/dtos/assessment-resources.dto';
import { SafeNoteHtmlPipe } from '../../pipes/safe-note-html.pipe';
import { BannerStateService, BannerType } from '../../services/banner-state.service';

@Component({
  selector: 'app-student-banner',
  standalone: true,
  imports: [CommonModule, SafeNoteHtmlPipe],
  templateUrl: './student-banner.component.html',
  styleUrls: ['./student-banner.component.scss'],
})
export class StudentBannerComponent implements OnInit {

  @Input() type: BannerType = 'info';
  @Input() title: string = '';
  @Input() text: string = '';
  @Input() icon: string = 'info';
  @Input() resources: AssessmentResourceI[] = [];

  isExpanded = true;

  constructor(private bannerState: BannerStateService) {}

  ngOnInit(): void {
    // Al iniciar, el banner está ABIERTO
    // => no debe haber icono en el header
    this.bannerState.open(this.type);

    // Escuchamos el estado global para abrir/cerrar desde el header
    const stream =
      this.type === 'info'
        ? this.bannerState.info$
        : this.bannerState.warning$;

    stream.subscribe(state => {
      this.isExpanded = state.expanded;
    });
  }

  /* =====================================================
     Toggle manual desde el banner
     ===================================================== */
  toggle(): void {
    if (this.isExpanded) {
      // Cerrar banner → mostrar icono en header
      this.bannerState.close(this.type, 1);
    } else {
      // Abrir banner → ocultar icono
      this.bannerState.open(this.type);
    }
  }

  /* =====================================================
     Click en el banner (misma lógica que toggle)
     ===================================================== */
  closeBanner(): void {
    if (this.isExpanded) {
      this.bannerState.close(this.type, 1);
    }
  }
}