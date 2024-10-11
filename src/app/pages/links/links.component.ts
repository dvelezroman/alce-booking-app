import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeetingLinkDto } from '../../services/dtos/booking.dto';
import { LinksService } from '../../services/links.service';
import { CreateLinkDto, CreateStageDto } from '../../services/dtos/student.dto';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './links.component.html',
  styleUrl: './links.component.scss'
})
export class LinksComponent implements OnInit {
  links: MeetingLinkDto[] = [];
  newLink: CreateLinkDto = {  description: '', link: '' };
  selectedLink: MeetingLinkDto | null = null;

  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDeleteModalOpen = false;

  constructor(private linksService: LinksService) {}

  ngOnInit(): void {
    this.fetchLinks();
  }

  fetchLinks(): void {
    this.linksService.getAll().subscribe(links => {
      this.links = links;
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.newLink = { link: '', description: '' };
  }

  createLink(): void {
    if (this.newLink.description && this.newLink.link) {
      const newLinkData: CreateLinkDto = {
        description: this.newLink.description,
        link: this.newLink.link
      };

      this.linksService.create(newLinkData).subscribe(link => {
        this.links.push(link); 
        this.closeCreateModal();
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
      this.linksService.update(this.selectedLink.id, this.selectedLink).subscribe(updatedLink => {
        const index = this.links.findIndex(link => link.id === updatedLink.id);
        if (index !== -1) {
          this.links[index] = updatedLink;
        }
        this.closeEditModal();
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
      this.linksService.delete(this.selectedLink.id).subscribe(() => {
        this.links = this.links.filter(link => link.id !== this.selectedLink?.id);
        this.closeDeleteModal();
      });
    }
  }
}
