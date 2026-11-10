package config

import (
	"log/slog"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Port         string `mapstructure:"PORT"`
	JWTSecret    string `mapstructure:"JWT_SECRET"`
	DatabasePath string `mapstructure:"DB_PATH"`

	// Limites do Plano Open Source (Community)
	MaxUsers    int `mapstructure:"MAX_USERS"`
	MaxWhatsApp int `mapstructure:"MAX_WHATSAPP"`
}

func Load() (*Config, error) {
	// Define valores padrão (ótimo para rodar o projeto rápido sem configurar nada)
	viper.SetDefault("PORT", "3000")
	viper.SetDefault("JWT_SECRET", "super-secret-key-change-me")
	viper.SetDefault("DB_PATH", "crm.db")
	viper.SetDefault("MAX_USERS", 3)
	viper.SetDefault("MAX_WHATSAPP", 1)

	// Configura o Viper para ler de arquivo .env se existir
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")

	// Permite sobrescrever via Variáveis de Ambiente do S.O. ou Docker
	viper.AutomaticEnv()
	// Substitui pontos por underscores para leitura do ENV
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			// Se o arquivo não existe, tudo bem (lê do ENV). Só loga erro se for erro de parse.
			slog.Warn("Arquivo .env não encontrado, usando variáveis de ambiente ou defaults")
		}
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		return nil, err
	}

	return &cfg, nil
}
