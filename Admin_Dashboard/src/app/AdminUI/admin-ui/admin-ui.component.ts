import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { UserService } from '../../UserServices/user.service';
import { User } from '../../Models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  selector: 'app-admin-ui',
  templateUrl: './admin-ui.component.html',
  styleUrls: ['./admin-ui.component.css'],
  providers: [UserService]
})
export class AdminUIComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: Set<number> = new Set<number>();
  searchQuery: string = '';
  selectedRole: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data: User[]) => {
      // Ensure all user fields are initialized to avoid null issues
      this.users = data.map(user => ({
        ...user,
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'N/A',
        isEditing: false
      }));
      this.filteredUsers = [...this.users];
    });
  }

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    this.searchQuery = inputElement?.value.toLowerCase() || '';
    this.applyFilters();
  }

  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement | null;
    this.selectedRole = selectElement?.value || '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesRole = this.selectedRole ? user.role.toLowerCase() === this.selectedRole.toLowerCase() : true;
      const matchesSearch = Object.values(user).some(val =>
        val && val.toString().toLowerCase().includes(this.searchQuery)
      );
      return matchesRole && matchesSearch;
    });
    this.currentPage = 1;
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  selectUser(userId: number): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  selectAllCurrentPage(): void {
    const currentIds = this.paginatedUsers.map(user => user.id);
    if (this.isAllSelected()) {
      currentIds.forEach(id => this.selectedUsers.delete(id));
    } else {
      currentIds.forEach(id => this.selectedUsers.add(id));
    }
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.every(user => this.selectedUsers.has(user.id));
  }

  deleteSelected(): void {
    this.filteredUsers = this.filteredUsers.filter(user => !this.selectedUsers.has(user.id));
    this.selectedUsers.clear();
    this.updatePaginationOnDelete();
  }

  editUser(user: User): void {
    user.isEditing = true;
  }

  saveUser(user: User): void {
    user.isEditing = false;
    // Optionally call a service to save the updated data
  }

  deleteUser(userId: number): void {
    this.filteredUsers = this.filteredUsers.filter(user => user.id !== userId);
    this.updatePaginationOnDelete();
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  private updatePaginationOnDelete(): void {
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages || 1;
    }
  }
}
