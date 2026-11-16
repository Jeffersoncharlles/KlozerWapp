package domain

import (
	"testing"
	"time"
)

func TestScheduleRequiresActivationAndConfiguration(t *testing.T) {
	schedule := Schedule{Timezone: "UTC", Days: []time.Weekday{time.Monday}, Intervals: []ScheduleInterval{{Start: "08:00", End: "18:00"}}}
	at := time.Date(2026, time.November, 9, 12, 0, 0, 0, time.UTC)
	if schedule.IsOpen(at) {
		t.Fatal("expected inactive schedule to be closed")
	}
	schedule.Enabled = true
	if !schedule.IsOpen(at) {
		t.Fatal("expected active schedule to be open")
	}
}

func TestScheduleUsesTimezoneAndRejectsInvalidIntervals(t *testing.T) {
	schedule := Schedule{Enabled: true, Timezone: "America/Sao_Paulo", Days: []time.Weekday{time.Monday}, Intervals: []ScheduleInterval{{Start: "08:00", End: "18:00"}}}
	if !schedule.IsOpen(time.Date(2026, time.November, 9, 12, 0, 0, 0, time.UTC)) {
		t.Fatal("expected local 09:00 to be open")
	}
	if schedule.IsOpen(time.Date(2026, time.November, 9, 22, 0, 0, 0, time.UTC)) {
		t.Fatal("expected local 19:00 to be closed")
	}
	if err := (Schedule{Timezone: "UTC", Days: []time.Weekday{time.Monday}, Intervals: []ScheduleInterval{{Start: "18:00", End: "08:00"}}}).Validate(); err == nil {
		t.Fatal("expected reversed interval to be invalid")
	}
}

func TestScheduleExceptionOverridesRegularHours(t *testing.T) {
	schedule := Schedule{
		Enabled: true, Timezone: "UTC", Days: []time.Weekday{time.Monday},
		Intervals: []ScheduleInterval{{Start: "08:00", End: "18:00"}},
		Exceptions: []ScheduleException{
			{Date: "2026-11-09", Open: false},
			{Date: "2026-11-10", Open: true, AllDay: true},
		},
	}
	if schedule.IsOpen(time.Date(2026, time.November, 9, 12, 0, 0, 0, time.UTC)) {
		t.Fatal("expected closed holiday exception")
	}
	if !schedule.IsOpen(time.Date(2026, time.November, 10, 2, 0, 0, 0, time.UTC)) {
		t.Fatal("expected open exception to override regular hours")
	}
}

func TestScheduleValidatesPolicyExceptionsAndClockFormat(t *testing.T) {
	base := Schedule{Timezone: "UTC", Days: []time.Weekday{time.Monday}, Intervals: []ScheduleInterval{{Start: "08:00", End: "18:00"}}}
	base.OutsideHoursPolicy = "unknown"
	if err := base.Validate(); err == nil {
		t.Fatal("expected unknown outside-hours policy to be rejected")
	}
	base.OutsideHoursPolicy = "send_and_close"
	base.Exceptions = []ScheduleException{{Date: "2026-11-09", Open: true, Intervals: []ScheduleInterval{{Start: "8:00", End: "09:00"}}}}
	if err := base.Validate(); err == nil {
		t.Fatal("expected exception clock without HH:mm padding to be rejected")
	}
}
