# Graph-Based Travel Planner System

This project is a Graph-Based Travel Planner built for our Data Structures and Algorithms project.  
It uses graph algorithms to plan smart travel routes between Indian places.

The main idea of this project is to represent cities and places as nodes, and roads or travel connections as edges.  
Using this graph structure, the system can find the best route based on distance, time, cost, scenic value, and vehicle type.

---

## Project Title

**Graph-Based Travel Planner Using DSA**

---

## Main Objective

The objective of this project is to create a smart travel planning system using Data Structures and Algorithms.

The system helps the user select a source and destination, choose a vehicle or travel mode, add famous places to visit, and then calculates the best possible route.

---

## DSA Concepts Used

This project mainly uses the following DSA concepts:

- Graph
- Weighted Graph
- Adjacency List
- Dijkstra's Algorithm
- Priority Queue
- BFS
- DFS
- Stack
- Queue
- Dictionary
- Lists
- Multi-stop route planning

---

## How Graph is Used

In this project:

- Cities and famous places are represented as nodes.
- Roads and travel connections are represented as edges.
- Distance, cost, time, and scenic score are used as edge weights.

Example:

Delhi → Jaipur → Mumbai

Here, Delhi, Jaipur, and Mumbai are nodes.  
The roads between them are edges.

---

## Features of the Project

- Source and destination based trip planning
- Shortest path calculation
- Fastest route calculation
- Cheapest route calculation
- Scenic route suggestion
- Vehicle-based planning
- Car, bike, EV, diesel, CNG, train, and flight options
- Famous places suggestions
- Add famous places into the journey
- Fuel, charging, and service stop suggestions
- Multi-stop route planning
- Smart ready-trip suggestions
- Summer, monsoon, winter, budget, and premium trip suggestions
- Route map visualization
- Thank-you screen after trip completion

---

## Algorithms Used

### Dijkstra's Algorithm

Dijkstra's Algorithm is used to find the best route between source and destination.

It helps in finding:

- Shortest distance route
- Lowest cost route
- Fastest route
- Scenic route based on route score

A priority queue is used to always select the city with the smallest current value.

---

### BFS

BFS stands for Breadth First Search.

It uses a queue and explores cities level by level.  
In this project, BFS helps to understand reachable places from a selected source.

---

### DFS

DFS stands for Depth First Search.

It explores one route deeply before backtracking.  
In this project, DFS is useful for exploring possible paths and route combinations.

---

### Stack

Stack is used for route history and undo operation.

It follows LIFO, which means Last In First Out.

---

### Queue

Queue is used in BFS traversal.

It follows FIFO, which means First In First Out.

---

## Technology Used

- HTML
- CSS
- JavaScript
- Python
- DSA concepts
- Graph algorithms

---

## Project Structure

```text
travel-planner/
│
├── index.html
├── static/
│   ├── app.js
│   ├── styles.css
│   └── static-planner.js
│
├── assets/
│   └── images
│
├── travel_graph.py
├── app.py
├── test_travel_graph.py
└── README.md
