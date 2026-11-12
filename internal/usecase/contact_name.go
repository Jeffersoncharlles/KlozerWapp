package usecase

import "strings"

// normalizeWhatsAppPhone keeps the number useful for display while leaving the
// original JID untouched in Contact.Phone for gateway operations.
func normalizeWhatsAppPhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if at := strings.IndexByte(phone, '@'); at >= 0 {
		phone = phone[:at]
	}
	if device := strings.IndexByte(phone, ':'); device >= 0 {
		phone = phone[:device]
	}
	return phone
}

func isGeneratedContactName(name string) bool {
	return strings.HasPrefix(strings.TrimSpace(name), "Cliente ")
}
