# skills.md

# Dave Hall's Prospector

Version: 1.0

---

# Project Summary

Dave Hall's Prospector is an AI-assisted hockey intelligence platform designed to aggregate, normalize, enrich, and visualize global player data for scouts, coaches, and hockey operations staff.

The application combines a continually growing MongoDB prospect database with Elite Prospects data enrichment to provide fast player discovery, statistical analysis, scouting insights, and interactive dashboards.

The platform is designed with scalability in mind and supports hundreds of thousands of player records.

---

# Core Capabilities

## Player Search

* Global player search
* Elite ID lookup
* Name normalization
* Team search
* League search
* Position search
* Nationality search

---

## Data Intelligence

* Prospect scoring
* Statistical normalization
* PPG calculations
* Position analysis
* League comparisons
* Country analytics
* Duplicate detection
* Data validation

---

## Player Enrichment

* Live Elite Prospects enrichment
* Player photographs
* Birth information
* Height and weight
* Shooting hand
* Jersey number
* Team metadata
* Career information

---

## Analytics

* Country distribution
* Position distribution
* Prospect score distribution
* Database statistics
* Search metrics
* Interactive dashboards
* Recharts visualizations

---

# Technical Stack

## Frontend

* React
* Vite
* React Router
* Recharts
* Modern CSS

---

## Backend

* Node.js
* Express

---

## Database

* MongoDB
* Mongoose

---

## APIs

* Elite Prospects API

---

# Architecture

The application follows a client/server architecture.

React Frontend

↓

Express REST API

↓

MongoDB

↓

Elite Prospects API (on-demand enrichment)

The database serves as the primary data source while external API calls are reserved for enrichment, minimizing latency and API usage.

---

# Engineering Features

* RESTful API architecture
* Server-side pagination
* Cached enrichment
* Dynamic filtering
* Live search
* Responsive design
* Modular React components
* Reusable Express routes
* Scalable MongoDB schema
* Error handling
* API rate limit awareness

---

# Data Scale

Current capabilities include:

* 187,000+ player records
* 100+ represented countries
* Global leagues
* Amateur through professional players
* Expandable schema for future scouting metrics

---

# Future Roadmap

* Advanced scouting reports
* AI-assisted player recommendations
* Similar player matching
* Prospect watchlists
* Team dashboards
* Draft class analysis
* Export tools
* Multi-user authentication
* Organization workspaces
* Notes and evaluations
* Video integration

---

# Development Principles

* Performance first
* Data accuracy over assumptions
* Modular architecture
* API-efficient design
* Scalable data model
* Clean component structure
* Responsive user experience
* Continuous improvement

---

# Repository Purpose

This repository demonstrates full-stack software engineering, data engineering, API integration, analytics, and scalable application architecture through the development of a modern hockey intelligence platform.
