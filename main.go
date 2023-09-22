package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
)

var statesData StatesData
var rootQuery = graphql.NewObject(graphql.ObjectConfig{
	Name: "RootQuery",
	Fields: graphql.Fields{
		"suggestions": &graphql.Field{
			Type: graphql.NewList(graphql.String),
			Args: graphql.FieldConfigArgument{
				"query": &graphql.ArgumentConfig{
					Type: graphql.String,
				},
			},
			Resolve: func(params graphql.ResolveParams) (interface{}, error) {
				query, _ := params.Args["query"].(string)
				filteredStates := filterStates(query)
				return filteredStates, nil
			},
		},
	},
})

func getStates() {
	// Read a file containing JSON data
	jsonData, err := ioutil.ReadFile("states_with_coordinates.json")
	if err != nil {
		fmt.Println("Error reading JSON file:", err)
		return
	}

	// Parse JSON data
	if err := json.Unmarshal(jsonData, &statesData); err != nil {
		fmt.Println("Error parsing JSON data:", err)
		return
	}
}

func filterStates(query string) []string {
	filtered := []string{}
	for _, state := range statesData.States {
		// Check if the state name contains the query string (case-insensitive)
		if strings.Contains(strings.ToLower(state.Name), strings.ToLower(query)) {
			filtered = append(filtered, state.Name)
		}
	}
	return filtered
}

type StateInfo struct {
	Name string  `json:"name"`
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
}

type StatesData struct {
	States []StateInfo `json:"states"`
}

func main() {
	getStates()
	schema, _ := graphql.NewSchema(graphql.SchemaConfig{
		Query: rootQuery,
	})

	h := handler.New(&handler.Config{
		Schema: &schema,
	})

	http.Handle("/graphql", h)

	http.Handle("/", http.FileServer(http.Dir("."))) // Serve static files (HTML, JS, CSS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	http.ListenAndServe(":"+port, nil)
	//http.ListenAndServe(":8080", nil)
}
