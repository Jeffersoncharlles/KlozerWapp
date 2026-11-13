package domain

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"
)

type ScheduleInterval struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// Schedule is the single source of truth for operating hours and automatic replies.
type Schedule struct {
	Enabled          bool               `json:"enabled"`
	Timezone         string             `json:"timezone"`
	Days             []time.Weekday     `json:"days"`
	Intervals        []ScheduleInterval `json:"intervals"`
	AllDay           bool               `json:"allDay"`
	AutoReplyEnabled bool               `json:"autoReplyEnabled"`
	WelcomeMessage   string             `json:"welcomeMessage"`
	ClosedMessage    string             `json:"closedMessage"`
}

func (s Schedule) IsConfigured() bool {
	return s.Timezone != "" && (s.AllDay || (len(s.Days) > 0 && len(s.Intervals) > 0))
}

func (s Schedule) IsOpen(at time.Time) bool {
	if !s.Enabled || !s.IsConfigured() {
		return false
	}
	if s.AllDay {
		return true
	}
	location, err := time.LoadLocation(s.Timezone)
	if err != nil {
		return false
	}
	local := at.In(location)
	for _, day := range s.Days {
		if day != local.Weekday() {
			continue
		}
		minutes := local.Hour()*60 + local.Minute()
		for _, interval := range s.Intervals {
			start, okStart := parseScheduleClock(interval.Start)
			end, okEnd := parseScheduleClock(interval.End)
			if okStart && okEnd && minutes >= start && minutes < end {
				return true
			}
		}
	}
	return false
}

func (s Schedule) Validate() error {
	if s.Timezone == "" {
		return errors.New("timezone é obrigatório")
	}
	if _, err := time.LoadLocation(s.Timezone); err != nil {
		return errors.New("timezone inválido")
	}
	if s.AllDay {
		return nil
	}
	if len(s.Days) == 0 {
		return errors.New("pelo menos um dia deve ser configurado")
	}
	if len(s.Intervals) == 0 {
		return errors.New("pelo menos um intervalo deve ser configurado")
	}
	for _, day := range s.Days {
		if day < time.Sunday || day > time.Saturday {
			return errors.New("dia da semana inválido")
		}
	}
	for _, interval := range s.Intervals {
		start, okStart := parseScheduleClock(interval.Start)
		end, okEnd := parseScheduleClock(interval.End)
		if !okStart || !okEnd || start >= end {
			return errors.New("intervalo de horário inválido")
		}
	}
	return nil
}

func parseScheduleClock(value string) (int, bool) {
	parts := strings.Split(value, ":")
	if len(parts) != 2 {
		return 0, false
	}
	hour, errHour := strconv.Atoi(parts[0])
	minute, errMinute := strconv.Atoi(parts[1])
	return hour*60 + minute, errHour == nil && errMinute == nil && hour >= 0 && hour < 24 && minute >= 0 && minute < 60
}

type ScheduleRepository interface {
	Get(context.Context) (*Schedule, error)
	Save(context.Context, *Schedule) error
}

type ScheduleUseCase interface {
	Get(context.Context) (*Schedule, error)
	Update(context.Context, Schedule) (*Schedule, error)
}
