// Package httpclient implements outbound HTTP adapters. Incoming API routes
// remain in delivery/http/handler; they do not perform requests for flow nodes.
package httpclient

import (
	"context"
	"errors"
	"io"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type client struct{ http *http.Client }

var reservedDestinations = []netip.Prefix{
	netip.MustParsePrefix("0.0.0.0/8"), netip.MustParsePrefix("100.64.0.0/10"),
	netip.MustParsePrefix("192.0.0.0/24"), netip.MustParsePrefix("192.0.2.0/24"),
	netip.MustParsePrefix("198.18.0.0/15"), netip.MustParsePrefix("198.51.100.0/24"),
	netip.MustParsePrefix("203.0.113.0/24"), netip.MustParsePrefix("240.0.0.0/4"),
	netip.MustParsePrefix("2001:db8::/32"), netip.MustParsePrefix("2001::/32"), netip.MustParsePrefix("2002::/16"),
}

func publicDestination(ip net.IP) bool {
	addr, ok := netip.AddrFromSlice(ip)
	if !ok {
		return false
	}
	addr = addr.Unmap()
	if !addr.IsGlobalUnicast() || addr.IsPrivate() || addr.IsLoopback() || addr.IsLinkLocalUnicast() {
		return false
	}
	if addr.Is6() && !netip.MustParsePrefix("2000::/3").Contains(addr) {
		return false
	}
	for _, prefix := range reservedDestinations {
		if prefix.Contains(addr) {
			return false
		}
	}
	return true
}

func NewFlowClient() (domain.FlowHTTPClient, func()) {
	transport := &http.Transport{Proxy: nil, MaxIdleConns: 10, IdleConnTimeout: 30 * time.Second, TLSHandshakeTimeout: 5 * time.Second}
	transport.DialContext = func(ctx context.Context, network, address string) (net.Conn, error) {
		host, port, err := net.SplitHostPort(address)
		if err != nil {
			return nil, err
		}
		ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
		if err != nil {
			return nil, err
		}
		if len(ips) == 0 {
			return nil, errors.New("destino sem endereço")
		}
		for _, addr := range ips {
			ip := addr.IP
			if !publicDestination(ip) {
				return nil, errors.New("destino HTTP não público")
			}
		}
		// Dial the validated IP rather than resolving the name a second time.
		return (&net.Dialer{Timeout: 5 * time.Second}).DialContext(ctx, network, net.JoinHostPort(ips[0].IP.String(), port))
	}
	c := &client{http: &http.Client{Transport: transport, Timeout: 10 * time.Second, CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
		return errors.New("redirecionamento HTTP não permitido")
	}}}
	return c, c.http.CloseIdleConnections
}

func (c *client) Execute(ctx context.Context, d domain.FlowNodeData) (string, error) {
	if len(d.Body) > 32768 {
		return "", errors.New("corpo HTTP excede 32 KiB")
	}
	if d.Method != "GET" && d.Method != "POST" {
		return "", errors.New("método HTTP não suportado")
	}
	req, err := http.NewRequestWithContext(ctx, d.Method, d.URL, strings.NewReader(d.Body))
	if err != nil {
		return "", err
	}
	if req.URL.User != nil || (req.URL.Scheme != "http" && req.URL.Scheme != "https") {
		return "", errors.New("URL inválida")
	}
	if port := req.URL.Port(); port != "" && port != "80" && port != "443" {
		return "", errors.New("porta HTTP não permitida")
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 65537))
	if err != nil {
		return "", err
	}
	if len(body) > 65536 {
		return "", errors.New("resposta HTTP excede 64 KiB")
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", errors.New("requisição HTTP retornou falha")
	}
	return string(body), nil
}
