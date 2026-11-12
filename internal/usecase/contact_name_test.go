package usecase

import "testing"

func TestNormalizeWhatsAppPhone(t *testing.T) {
	tests := []struct {
		name  string
		phone string
		want  string
	}{
		{name: "jid", phone: "5511999999999@s.whatsapp.net", want: "5511999999999"},
		{name: "device jid", phone: "5511999999999:3@s.whatsapp.net", want: "5511999999999"},
		{name: "plain phone", phone: "5511999999999", want: "5511999999999"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := normalizeWhatsAppPhone(tt.phone); got != tt.want {
				t.Fatalf("normalizeWhatsAppPhone() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestIsGeneratedContactName(t *testing.T) {
	if !isGeneratedContactName("Cliente 5511999999999") {
		t.Fatal("expected generated contact name")
	}
	if isGeneratedContactName("Maria") {
		t.Fatal("expected real contact name not to be generated")
	}
}
