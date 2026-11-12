package domain

import (
	"context"
	"strconv"
	"strings"
	"time"
)

type BusinessHoursInterval struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type BusinessHours struct {
	Enabled         bool                    `json:"enabled"`
	Timezone        string                  `json:"timezone"`
	Days            []time.Weekday          `json:"days"`
	Intervals       []BusinessHoursInterval `json:"intervals"`
	AllDay          bool                    `json:"allDay"`
	NewConversation string                  `json:"newConversation"`
	Automation      string                  `json:"automation"`
	QueueWaiting    string                  `json:"queueWaiting"`
	ManualMessage   string                  `json:"manualMessage"`
	Resume          string                  `json:"resume"`
}

func (hours BusinessHours) IsOpen(at time.Time) bool {
	if !hours.Enabled || hours.AllDay {
		return true
	}
	location, err := time.LoadLocation(hours.Timezone)
	if err != nil {
		return false
	}
	local := at.In(location)
	dayEnabled := false
	for _, day := range hours.Days {
		if day == local.Weekday() {
			dayEnabled = true
			break
		}
	}
	if !dayEnabled {
		return false
	}
	minutes := local.Hour()*60 + local.Minute()
	for _, interval := range hours.Intervals {
		start, okStart := parseClock(interval.Start)
		end, okEnd := parseClock(interval.End)
		if okStart && okEnd && minutes >= start && minutes < end {
			return true
		}
	}
	return false
}

func parseClock(value string) (int, bool) {
	parts := strings.Split(value, ":")
	if len(parts) != 2 {
		return 0, false
	}
	hour, errHour := strconv.Atoi(parts[0])
	minute, errMinute := strconv.Atoi(parts[1])
	return hour*60 + minute, errHour == nil && errMinute == nil && hour >= 0 && hour < 24 && minute >= 0 && minute < 60
}

// WhatsAppConfiguration contains optional policies for the installation's
// WhatsApp session. Empty IDs intentionally mean that the policy is not set.
type WhatsAppConfiguration struct {
	FlowID               string        `json:"flowId"`
	QueueID              string        `json:"queueId"`
	BusinessHoursEnabled bool          `json:"businessHoursEnabled"`
	BusinessHours        BusinessHours `json:"businessHours"`
}

type WhatsAppConfigurationRepository interface {
	Get(context.Context) (*WhatsAppConfiguration, error)
	Save(context.Context, *WhatsAppConfiguration) error
}

type WhatsAppConfigurationUseCase interface {
	Get(context.Context) (*WhatsAppConfiguration, error)
	Update(context.Context, WhatsAppConfiguration) (*WhatsAppConfiguration, error)
}
