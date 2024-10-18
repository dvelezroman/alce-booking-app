import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeetingLinkDto } from '../../services/dtos/booking.dto';
import { LinksService } from '../../services/links.service';
import { CreateLinkDto } from '../../services/dtos/student.dto';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss']
})
export class LinksComponent implements OnInit {
  links: MeetingLinkDto[] = [];
  newLink: CreateLinkDto = {  description: '', link: '', password: '' };
  selectedLink: MeetingLinkDto | null = null;

  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  errorMessage: string = '';
  isErrorModalOpen = false;

  constructor(private linksService: LinksService) {}

  ngOnInit(): void {
    this.fetchLinks();
  }

  fetchLinks(): void {
    this.linksService.getAll().subscribe({
      next: (links) => {
        this.links = links;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newLink = { link: '', description: '', password: '' };
  }

  createLink(): void {
    if (this.newLink.description && this.newLink.link) {
      const newLinkData: CreateLinkDto = {
        description: this.newLink.description,
        link: this.newLink.link,
        password: this.newLink.password,
      };

      this.linksService.create(newLinkData).subscribe({
        next: () => {
          this.fetchLinks();
          this.closeCreateModal();
        },
        error: () => {
          this.handleError('Error: Ud intentó crear un Link que ya existe.');
        }
      });
    }
  }

  openEditModal(link: MeetingLinkDto): void {
    this.selectedLink = { ...link };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedLink = null;
  }

  updateLink(): void {
    if (this.selectedLink) {
      this.linksService.update(this.selectedLink.id, this.selectedLink).subscribe({
        next: () => {
          this.fetchLinks();
          this.closeEditModal();
        },
        error: () => {
          this.handleError('No se pudo actualizar el Link!');
        }
      });
    }
  }

  openDeleteModal(link: MeetingLinkDto): void {
    this.selectedLink = link;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedLink = null;
  }

  deleteLink(): void {
    if (this.selectedLink) {
      this.linksService.delete(this.selectedLink.id).subscribe({
        next: () => {
          this.fetchLinks();
          this.closeDeleteModal();
        },
        error: () => {
          this.handleError('No se pudo eliminar el Link!');
        }
      });
    }
  }

  handleError(error: string): void {
    this.errorMessage = error || 'Ocurrió un error!';
    this.isErrorModalOpen = true;
  }

  closeErrorModal(): void {
    this.isErrorModalOpen = false;
    this.errorMessage = '';
  }
}
