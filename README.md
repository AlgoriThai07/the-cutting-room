# THE CUTTING ROOM
## A communal wall of rejected work where narrative emerges from collective fragments

---

## Concept

The Cutting Room is an interactive storytelling application built around a simple premise:

Instead of sharing what we are proud of, users share what they abandoned.

People upload discarded photos and unfinished text. The system does not judge individual contributions. Instead, an AI curator analyzes the collection as a whole and discovers patterns — clustering fragments and writing interpretive “wall notes” explaining what the community seems to be unconsciously creating.

The story is not written by authors.
The story emerges from collective behavior.

This transforms users into participants inside a living narrative environment.

---

## Core Experience

Users interact with a shared Wall.

They can:
- upload an abandoned photo
- upload unfinished text
- optionally describe why they cut it
- later “claim” a fragment to connect it to their profile

The system then:
1. extracts meaning from fragments using embeddings
2. groups similar fragments together
3. generates a curator-style narrative interpretation
4. assigns an ambient music mood to the cluster

The result feels closer to walking through a gallery installation than browsing a social feed.

---

## Social Design

We intentionally avoid standard social media dynamics.

### Community-first
- Each user may follow up to 40 friends
- This keeps the network intimate
- Encourages honesty instead of performance

### Dual Identity

Community Wall
anonymous fragments contribute to narrative

Personal Studio
users can claim fragments and show finished work

A fragment can be posted anonymously to the wall, then later claimed if the user wants authorship.

This encourages participation without fear while still allowing engagement.

### Engagement Features
To keep activity alive:
- likes
- comments
- following
- notifications

Likes apply to fragments and clusters, but discovery centers around the shared wall rather than individual profiles.

---

## Features

### Wall
- spatial grid layout
- live cluster grouping
- cluster notes written by AI
- optional background music mood

### Clusters
Each grouping includes:
- cluster title
- AI curator wall note
- recommended music genre
- optional randomly selected track

Example wall note:

“These fragments stop at the moment before human connection — hands cropped, conversations unfinished, faces turned away.”

Music mood: ambient piano

---

## Technical Architecture

### Stack (Hackathon-Friendly)

Frontend
- React (MERN stack)
- Bootstrap
- Masonry grid library (for wall layout)

Backend
- Node.js
- Express.js REST API

Database
- MongoDB Atlas

Media Storage
- Cloudflare R2 (image storage)

Deployment
- aedify.ai

---

## AI Pipeline

We do not train models. We orchestrate existing ones.

### Step 1 — Content Intake
User uploads image or text.

Images are stored in Cloudflare R2.
Metadata is stored in MongoDB.

---

### Step 2 — Embedding Extraction

We generate semantic vectors for each fragment.

Text → embedding model
Image → image caption → embedding model

Each fragment becomes a vector representation of meaning.

fragment → embedding vector → stored in MongoDB

---

### Step 3 — Clustering (K-Means)

We periodically run clustering:

1. fetch all embeddings
2. normalize vectors
3. run K-Means (k = 3–6 depending on fragment count)
4. assign cluster_id to each fragment

This produces emergent thematic groups.

---

### Step 4 — Cluster Interpretation (AI Curator)

For each cluster:

1. sample ~10 fragments
2. generate captions (for images)
3. summarize shared themes
4. send to LLM for interpretation

Curator prompt style:

You are a museum curator.
Write a short interpretive wall label explaining the pattern connecting these works.
Be tentative and reflective, not authoritative.
Do not describe individual items; describe the shared behavior.

Output:
- wall note
- short title

---

### Step 5 — Music Mood Generation

We also generate:
- a music genre or mood (ambient, lo-fi, piano, city noise, etc.)
- optionally attach a random track from a predefined list

This reinforces emotional immersion.

---

## Database Design (MongoDB)

Users
_id
username
email
password_hash
followers[]
following[]
claimed_fragments[]

Fragments
_id
type (image | text)
content_url or text_body
embedding[]
cluster_id
author_id (nullable)
claimed (bool)
created_at
cut_reason (optional)

Clusters
_id
title
wall_note
music_mood
track_id (optional)
updated_at

Comments
_id
user_id
fragment_id OR cluster_id
text
created_at

Likes
_id
user_id
target_id
target_type (fragment | cluster)

---

## Claiming Mechanic

Users can retroactively claim a fragment.

Effects:
- attaches fragment to profile
- increases engagement
- encourages posting without fear

This solves the hesitation problem and encourages participation.

---

## UI / Design Direction

Light theme only.

Goals:
- warm
- approachable
- not futuristic

Visual style:
- soft beige or cream background
- pinned paper cards
- slightly imperfect borders
- handwritten style accents
- corkboard inspiration

The application should feel like a studio wall, not a tech platform.

---

## How to Run (Development)

1. Clone
git clone <repo>
cd cutting-room

2. Backend
cd server
npm install
npm run dev

3. Frontend
cd client
npm install
npm start

4. Environment Variables
Create .env

MONGODB_URI=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
EMBEDDING_API_KEY=
LLM_API_KEY=

---

## Demo Flow (Important for Judges)

1. Upload fragments
2. Show anonymous wall
3. Trigger clustering
4. Reveal generated wall note
5. Play cluster music
6. Claim a fragment
7. Show personal studio

The reveal of the cluster narrative is the emotional centerpiece of the demo.

---

## Why This Matters

Most platforms reward polished outcomes.

The Cutting Room studies:
- hesitation
- incompletion
- creative doubt

It turns private rejection into shared narrative.

The story is not written by a single author.
The story is written by everyone accidentally.

---

## Future Work
- audio fragments
- evolving clusters over time
- public installations

---

## One-Sentence Pitch

The Cutting Room is a communal wall of rejected work where an AI curator groups what people throw away and discovers the story those rejections are collectively telling.