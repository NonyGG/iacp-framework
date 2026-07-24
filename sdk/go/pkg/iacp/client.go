// Package iacp provides the Go SDK for IACP Framework.
package iacp

import "fmt"

const Version = "0.2.0"

type Client struct {
	ID string
}

func NewClient(id string) *Client {
	if id == "" { id = fmt.Sprintf("go-%x", len(id)+1) }
	return &Client{ID: id}
}

func (c *Client) Send(to string, payload interface{}) map[string]interface{} {
	return map[string]interface{}{"from": c.ID, "to": to, "payload": payload}
}

func (c *Client) Request(to string, payload interface{}) map[string]interface{} {
	return c.Send(to, payload)
}
