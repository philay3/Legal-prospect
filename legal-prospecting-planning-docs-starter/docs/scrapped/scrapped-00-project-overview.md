# 00 — Project Overview

## Project Name

Legal Prospecting App

## One-Sentence Summary

A web app that helps legal-software account executives find small, local law firm prospects by searching a ZIP code.

## Problem

Legal software sales teams often need to find small boutique law firms in specific local markets. Manually researching firms by ZIP code, checking whether they are a good fit, and organizing the results can be slow and repetitive.

## Proposed Solution

The app lets a user enter a ZIP code and returns a list of qualifying law firms. The firms are stored in the database under that ZIP code so the user can come back later, review prior ZIP research, and eventually save or manage leads through a dashboard.

## Primary User

Legal-software account executives prospecting small boutique law firms.

## User Goal

Find local law firms that are plausible prospects for legal research, legal AI, or legal software products.

## Bootcamp MVP Goal

Deliver a stable, demo-ready app where a user can:

1. Enter a ZIP code.
2. Run a law firm search.
3. View useful firm results.
4. Reopen previously searched ZIP codes.
5. See clean, basic prospect information.
6. Avoid broken empty-success states.
7. Demonstrate a clear full-stack architecture.

## Future Product Goal

Extend the app into a lightweight sales prospecting workspace with better search, validation, enrichment, saved leads, tasks, notes, call/email/meeting workflows, exports, filters, and analytics.

## Current Status

Search has been fixed and is performing much better. It should now be treated as the working baseline. The next planning focus is not emergency repair; it is protecting search behavior with tests and then improving reliability in controlled steps.

## High-Level App Flow

```text
User enters ZIP code
-> App searches for local law firms
-> Research worker identifies likely law firm prospects
-> Firms are saved under the ZIP code
-> Results table displays firms
-> Sidebar/history lets user reopen cached ZIP research
```

## Value Proposition

The app reduces the time needed to find local law firm prospects and gives the user a structured place to review and eventually manage those leads.

## Success Definition for Bootcamp

The app is successful for bootcamp if:

1. The core search flow works during demo.
2. The data model is explainable.
3. The user interface is understandable.
4. Results are relevant enough to show product value.
5. Testing/verification is documented.
6. Future roadmap is clear but not overbuilt.
