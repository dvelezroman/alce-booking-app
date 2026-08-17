import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MeetingLinkDto } from '../../../services/dtos/booking.dto';
import { CreateLinkDto } from '../../../services/dtos/student.dto';
import { LinksService } from '../../../services/links.service';

/* =========================
   CHILD COMPONENTS
========================= */

import { LinksHeaderComponent } from '../../../components/links/links-header/links-header.component';
import { LinksFiltersComponent } from '../../../components/links/links-filters/links-filters.component';
import { LinksTableComponent } from '../../../components/links/links-table/links-table.component';
import { LinksPaginationComponent } from '../../../components/links/links-pagination/links-pagination.component';
import { LinksFormModalComponent } from '../../../components/links/links-form-modal/links-form-modal.component';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';


@Component({
  selector: 'app-links',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    LinksHeaderComponent,
    LinksFiltersComponent,
    LinksTableComponent,
    LinksPaginationComponent,
    LinksFormModalComponent,
  ],
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {

  /* =========================
    FILTERS
  ========================= */

  searchTerm = '';

  /* =========================
     DATA
  ========================= */

  links: MeetingLinkDto[] = [];
  pagedLinks: MeetingLinkDto[] = [];

  newLink: CreateLinkDto = {
    description: '',
    link: '',
    password: '',
  };

  selectedLink: MeetingLinkDto | null = null;


  /* =========================
     MODALS
  ========================= */

  modal: ModalDto = modalInitializer();

  isCreateModalOpen = false;
  isEditModalOpen = false;
  isEditPasswordModalOpen = false;

  errorMessage: string = '';
  isErrorModalOpen = false;


  /* =========================
     PAGINATION
  ========================= */

  page = 1;
  limit = 10;

  readonly limitOptions = [
    10,
    20,
    50,
    100,
  ];


  constructor(
    private linksService: LinksService,
  ) {}


  ngOnInit(): void {
    this.fetchLinks();
  }


  /* =========================
     FETCH
  ========================= */

  fetchLinks(): void {
    this.linksService.getAll().subscribe({
      next: (links) => {
        this.links = links;

        /*
         * Si después de eliminar un registro
         * la página actual deja de existir,
         * regresamos a la última disponible.
         */
        if (this.page > this.totalPages) {
          this.page = this.totalPages;
        }

        this.updatePagedLinks();
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

    /* =========================
      SEARCH
    ========================= */

   get filteredLinks(): MeetingLinkDto[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();
    if (!term) {
      return this.links;
    }

    return this.links.filter(link => {
      const description =
        link.description
          ?.toLowerCase() || '';
      const url =
        link.link
          ?.toLowerCase() || '';
      const id =
        String(link.id);

      return (
        description.includes(term) ||
        url.includes(term) ||
        id.includes(term)
      );
    });
  }

  onSearchChange(
    value: string,
  ): void {
    this.searchTerm = value;
    this.page = 1;
    this.updatePagedLinks();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.updatePagedLinks();
  }


  /* =========================
     CREATE
  ========================= */

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }


  closeCreateModal(): void {
    this.isCreateModalOpen = false;

    this.newLink = {
      link: '',
      description: '',
      password: '',
    };
  }


  createLink(): void {
    if (
      this.newLink.description &&
      this.newLink.link
    ) {
      const newLinkData: CreateLinkDto = {
        description:
          this.newLink.description,

        link:
          this.newLink.link,

        password:
          this.newLink.password,
      };

      this.linksService
        .create(newLinkData)
        .subscribe({
          next: () => {
            this.fetchLinks();
            this.closeCreateModal();
          },
          error: () => {
            this.handleError(
              'Error: Ud intentó crear un Link que ya existe.',
            );
          }
        });
    }
  }


  /* =========================
     EDIT
  ========================= */

  openEditModal(
    link: MeetingLinkDto,
  ): void {
    this.selectedLink = {
      ...link,
    };

    this.isEditModalOpen = true;
  }


  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedLink = null;
  }


  updateLink(): void {
    if (this.selectedLink) {
      this.linksService
        .update(
          this.selectedLink.id,
          this.selectedLink,
        )
        .subscribe({
          next: () => {
            this.fetchLinks();
            this.closeEditModal();
          },
          error: () => {
            this.handleError(
              'No se pudo actualizar el Link!',
            );
          }
        });
    }
  }


  /* =========================
     PASSWORD
  ========================= */

  openEditPasswordModal(
    link: MeetingLinkDto,
  ): void {
    this.selectedLink = {
      ...link,
    };

    // Guardamos el link seleccionado
    this.isEditPasswordModalOpen = true;
    // Mostramos el modal
  }


  closeEditPasswordModal(): void {
    this.isEditPasswordModalOpen = false;
    // Cerramos el modal

    this.selectedLink = null;
    // Limpiamos el link seleccionado
  }


  updatePassword(): void {
    if (this.selectedLink) {
      const updateData = {
        password:
          this.selectedLink.password,
      };
      // Solo enviamos la contraseña

      this.linksService
        .update(
          this.selectedLink.id,
          updateData,
        )
        .subscribe({
          next: () => {
            this.fetchLinks();
            // Refrescamos los links

            this.closeEditPasswordModal();
            // Cerramos el modal
          },
          error: () => {
            this.handleError(
              'No se pudo actualizar el password del Link!',
            );
          }
        });
    }
  }


  /* =========================
     DELETE
  ========================= */

  openDeleteModal(
    link: MeetingLinkDto,
  ): void {
    this.selectedLink = link;

    this.modal = {
      ...modalInitializer(),

      show: true,

      message:
        `¿Deseas eliminar el enlace "${link.description || 'Sin descripción'}"?`,

      isError: false,
      isSuccess: false,
      isInfo: true,

      showButtons: true,

      confirm: () => {
        this.deleteLink();
      },

      close: () => {
        this.modal.show = false;
        this.selectedLink = null;
      },
    };
  }


  closeDeleteModal(): void {
    this.modal.show = false;
    this.selectedLink = null;
  }


  deleteLink(): void {
    if (!this.selectedLink) {
      return;
    }

    const linkToDelete =
      this.selectedLink;

    this.linksService
      .delete(linkToDelete.id)
      .subscribe({
        next: () => {
          this.selectedLink = null;

          this.fetchLinks();

          this.modal = {
            ...modalInitializer(),

            show: true,

            message:
              'Enlace eliminado correctamente.',

            isError: false,
            isSuccess: true,
            isInfo: false,

            showButtons: false,

            close: () => {
              this.modal.show = false;
            },
          };
        },

        error: () => {
          this.selectedLink = null;

          this.modal = {
            ...modalInitializer(),

            show: true,

            message:
              'No se pudo eliminar el enlace.',

            isError: true,
            isSuccess: false,
            isInfo: false,

            showButtons: false,

            close: () => {
              this.modal.show = false;
            },
          };
        },
      });
  }


  /* =========================
     ERROR
  ========================= */

  handleError(
    error: string,
  ): void {
    this.errorMessage =
      error ||
      'Ocurrió un error!';

    this.isErrorModalOpen = true;
  }


  closeErrorModal(): void {
    this.isErrorModalOpen = false;
    this.errorMessage = '';
  }


  /* =========================
     PAGINATION
  ========================= */

  updatePagedLinks(): void {
    const start =
      (this.page - 1) *
      this.limit;

    this.pagedLinks =
      this.filteredLinks.slice(
        start,
        start + this.limit,
      );
  }


  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
    this.updatePagedLinks();
  }


  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
    this.updatePagedLinks();
  }


  onPageChange(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
    this.updatePagedLinks();
  }


  onLimitChange(
    value: number,
  ): void {
    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit = limit;
    this.page = 1;

    this.updatePagedLinks();
  }


  /* =========================
     PAGINATION STATE
  ========================= */

  get total(): number {
    return this.filteredLinks.length;
  }


  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }


  get canPrev(): boolean {
    return this.page > 1;
  }


  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  get startIndex(): number {
    if (!this.total) {
      return 0;
    }

    return (
      (this.page - 1) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {
    return Math.min(
      this.page *
      this.limit,
      this.total,
    );
  }


  get paginationLabel(): string {
    if (!this.total) {
      return '0 enlaces';
    }

    return (
      `Página ${this.page} de ${this.totalPages} ` +
      `(${this.total} enlaces)`
    );
  }
}