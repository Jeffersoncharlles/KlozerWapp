package domain

import (
	"testing"
	"time"
)

func TestBusinessHoursIsOpenUsesConfiguredTimezoneAndInterval(t *testing.T) {
	hours := BusinessHours{Enabled: true, Timezone: "America/Sao_Paulo", Days: []time.Weekday{time.Monday}, Intervals: []BusinessHoursInterval{{Start: "08:00", End: "18:00"}}}
	in := time.Date(2026, time.November, 9, 12, 0, 0, 0, time.UTC) // 09:00 in Sao Paulo
	out := time.Date(2026, time.November, 9, 22, 0, 0, 0, time.UTC)
	if !hours.IsOpen(in) {
		t.Fatal("expected configured interval to be open")
	}
	if hours.IsOpen(out) {
		t.Fatal("expected outside interval to be closed")
	}
}

func TestBusinessHoursIsOpenHonorsDayAndAllDay(t *testing.T) {
	hours := BusinessHours{Enabled: true, Timezone: "UTC", Days: []time.Weekday{time.Monday}, Intervals: []BusinessHoursInterval{{Start: "08:00", End: "18:00"}}}
	sunday := time.Date(2026, time.November, 8, 12, 0, 0, 0, time.UTC)
	if hours.IsOpen(sunday) {
		t.Fatal("expected disabled day to be closed")
	}
	hours.AllDay = true
	if !hours.IsOpen(sunday) {
		t.Fatal("expected all-day schedule to be open")
	}
}
