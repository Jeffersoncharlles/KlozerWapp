package domain

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type ScheduleInterval struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type ScheduleException struct {
	Date      string             `json:"date"`
	Open      bool               `json:"open"`
	Closed    bool               `json:"closed,omitempty"`
	AllDay    bool               `json:"allDay"`
	Intervals []ScheduleInterval `json:"intervals"`
}

// Schedule is the single source of truth for operating hours and automatic replies.
type Schedule struct {
	Enabled              bool                `json:"enabled"`
	Timezone             string              `json:"timezone"`
	Days                 []time.Weekday      `json:"days"`
	Intervals            []ScheduleInterval  `json:"intervals"`
	AllDay               bool                `json:"allDay"`
	AutoReplyEnabled     bool                `json:"autoReplyEnabled"`
	WelcomeMessage       string              `json:"welcomeMessage"`
	ClosedMessage        string              `json:"closedMessage"`
	ManualWelcomeMessage string              `json:"manualWelcomeMessage"`
	ManualWelcomeEnabled bool                `json:"manualWelcomeEnabled"`
	OutsideHoursPolicy   string              `json:"outsideHoursPolicy"`
	Exceptions           []ScheduleException `json:"exceptions"`
}

func (s Schedule) IsConfigured() bool {
	return s.Timezone != "" && (s.AllDay || (len(s.Days) > 0 && len(s.Intervals) > 0))
}

func (s Schedule) IsOpen(at time.Time) bool {
	if !s.Enabled || !s.IsConfigured() {
		return false
	}
	location, err := time.LoadLocation(s.Timezone)
	if err != nil {
		return false
	}
	local := at.In(location)
	for _, exception := range s.Exceptions {
		if exception.Date != local.Format("2006-01-02") {
			continue
		}
		if exception.Closed || !exception.Open {
			return false
		}
		if exception.AllDay || len(exception.Intervals) == 0 {
			return true
		}
		return isOpenAt(local, exception.Intervals)
	}
	if s.AllDay {
		return true
	}
	for _, day := range s.Days {
		if day != local.Weekday() {
			continue
		}
		return isOpenAt(local, s.Intervals)
	}
	return false
}

func isOpenAt(local time.Time, intervals []ScheduleInterval) bool {
	minutes := local.Hour()*60 + local.Minute()
	for _, interval := range intervals {
		start, okStart := parseScheduleClock(interval.Start)
		end, okEnd := parseScheduleClock(interval.End)
		if okStart && okEnd && minutes >= start && minutes < end {
			return true
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
		return s.validateMessagesAndExceptions()
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
	seenDays := map[time.Weekday]bool{}
	for _, day := range s.Days {
		if seenDays[day] {
			return errors.New("dias da semana não podem se repetir")
		}
		seenDays[day] = true
	}
	for _, interval := range s.Intervals {
		start, okStart := parseScheduleClock(interval.Start)
		end, okEnd := parseScheduleClock(interval.End)
		if !okStart || !okEnd || start >= end {
			return errors.New("intervalo de horário inválido")
		}
	}
	return s.validateMessagesAndExceptions()
}

func (s Schedule) validateMessagesAndExceptions() error {
	if s.OutsideHoursPolicy != "" {
		switch s.OutsideHoursPolicy {
		case "send_and_close", "send_message_and_close", "keep_open", "queue", "automation", "inform_only":
		default:
			return fmt.Errorf("política fora do horário inválida")
		}
	}
	if len(s.WelcomeMessage) > 16000 || len(s.ManualWelcomeMessage) > 16000 || len(s.ClosedMessage) > 16000 {
		return errors.New("mensagem excede o limite de 16000 bytes")
	}
	seen := map[string]bool{}
	for _, exception := range s.Exceptions {
		if _, err := time.Parse("2006-01-02", exception.Date); err != nil {
			return errors.New("data de exceção inválida")
		}
		if seen[exception.Date] {
			return errors.New("datas de exceção não podem se repetir")
		}
		seen[exception.Date] = true
		for _, interval := range exception.Intervals {
			start, okStart := parseScheduleClock(interval.Start)
			end, okEnd := parseScheduleClock(interval.End)
			if !okStart || !okEnd || start >= end {
				return errors.New("intervalo de exceção inválido")
			}
		}
	}
	return nil
}

func parseScheduleClock(value string) (int, bool) {
	if len(value) != 5 || value[2] != ':' || value[0] < '0' || value[0] > '9' || value[1] < '0' || value[1] > '9' || value[3] < '0' || value[3] > '9' || value[4] < '0' || value[4] > '9' {
		return 0, false
	}
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
