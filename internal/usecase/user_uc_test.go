package usecase

import (
	"context"
	"testing"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type userRepositoryStub struct {
	users []domain.User
}

func (r *userRepositoryStub) Create(_ context.Context, user *domain.User) error {
	r.users = append(r.users, *user)
	return nil
}
func (r *userRepositoryStub) GetByID(_ context.Context, id string) (*domain.User, error) {
	for i := range r.users {
		if r.users[i].ID == id {
			return &r.users[i], nil
		}
	}
	return nil, domain.FlowNotFound()
}
func (r *userRepositoryStub) GetByEmail(context.Context, string) (*domain.User, error) {
	return nil, nil
}
func (r *userRepositoryStub) List(context.Context) ([]domain.User, error) { return r.users, nil }
func (r *userRepositoryStub) CountActiveUsers(context.Context) (int64, error) {
	var count int64
	for _, user := range r.users {
		if user.IsActive {
			count++
		}
	}
	return count, nil
}
func (r *userRepositoryStub) CountActiveAdmins(context.Context) (int64, error) {
	var count int64
	for _, user := range r.users {
		if user.IsActive && user.Role == "ADMIN" {
			count++
		}
	}
	return count, nil
}
func (r *userRepositoryStub) UpdateStatus(_ context.Context, id string, active bool) error {
	for i := range r.users {
		if r.users[i].ID == id {
			r.users[i].IsActive = active
			return nil
		}
	}
	return nil
}
func (r *userRepositoryStub) Update(_ context.Context, user *domain.User) error {
	for i := range r.users {
		if r.users[i].ID == user.ID {
			r.users[i] = *user
			return nil
		}
	}
	return nil
}

func TestUserUseCaseDefaultsToAttendant(t *testing.T) {
	repo := &userRepositoryStub{}
	uc := NewUserUseCase(repo)
	user, err := uc.Create(context.Background(), "Maria", "maria@example.com", "123456", "")
	if err != nil {
		t.Fatal(err)
	}
	if user.Role != "ATTENDANT" {
		t.Fatalf("role = %q, want ATTENDANT", user.Role)
	}
}

func TestUserUseCaseProtectsLastAdmin(t *testing.T) {
	repo := &userRepositoryStub{users: []domain.User{{ID: "admin", Role: "ADMIN", IsActive: true}}}
	uc := NewUserUseCase(repo)
	if err := uc.Deactivate(context.Background(), "admin"); err == nil {
		t.Fatal("expected the last active admin to be protected")
	}
}
