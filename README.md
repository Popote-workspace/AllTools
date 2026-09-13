# AllTools

ALLTOOLS — GITHUB PRODUCTION EXPORT

The AllTools project is now ready to be moved out of Lovable and independently deployed.

Your task is to prepare and push the complete, clean, production-ready source code of this project to my GitHub repository.

PRIMARY OBJECTIVE

Push the complete AllTools project to GitHub.

Do NOT deploy it to a Lovable custom domain.

Do NOT require Lovable Pro.

The GitHub repository must contain everything required to independently deploy the application through Netlify.

1. SOURCE CODE

Push the complete application source code, including:

React/TypeScript source

package.json

package-lock.json or equivalent lockfile

Vite configuration

Tailwind configuration if used

TypeScript configuration

public assets

src directory

reusable components

pages/routes

calculator logic

SEO components

legal pages

configuration files

favicon/logo assets

robots.txt

sitemap configuration

README.md

all other files required to build the application

Do NOT omit files simply because Lovable normally manages them.

2. REMOVE LOVABLE DEPENDENCY WHERE POSSIBLE

The application must be portable.

Do not make the project dependent on:

Lovable hosting

Lovable custom domains

Lovable-specific deployment

unnecessary proprietary services

If any Lovable-specific integration is genuinely required, clearly document it in README.md.

The application should be able to run with standard commands such as:

npm install npm run build npm run dev

3. NETLIFY COMPATIBILITY

Prepare the project for Netlify deployment.

If required, create:

netlify.toml

Use the correct build configuration for the framework actually used.

The production build must generate the correct output directory.

If this is a Vite application, configure the project appropriately for Vite.

4. SPA ROUTING

AllTools contains multiple routes.

Make sure direct navigation works for URLs such as:

/tools/acre-hectare-converter /tools/percentage-calculator /tools/age-calculator /tools/loan-calculator /tools/paye-calculator /tools/salary-calculator /tools/house-construction-cost-calculator /tools/car-import-duty-calculator /tools/cv-ats-checker /tools/election-countdown /tools/unit-converter /tools/word-counter /tools/pdf-tools /tools/kenya-fuel-cost-calculator /tools/date-difference-calculator

Configure Netlify redirects if necessary so refreshing a route does not produce a 404.

5. ENVIRONMENT VARIABLES

Review the entire project for API keys, secrets or environment variables.

NEVER commit:

API keys

passwords

private credentials

service-role keys

secret tokens

Create a safe:

.env.example

containing only the names of required environment variables.

The application must not expose secrets in frontend code.

6. SUPABASE

If Supabase is currently used:

keep the public client configuration safe

NEVER expose a Supabase service-role key

document required environment variables

ensure the project can still build on Netlify

If Supabase is not actually required for the current MVP, do not introduce it unnecessarily.

7. ADSENSE ARCHITECTURE

Keep the AdSense-ready architecture already created.

Do NOT add fake advertisements.

Keep advertising disabled until the real Google AdSense publisher information is available.

Use a central configuration approach.

The site must remain useful and clean without advertisements.

8. SEO

Ensure the GitHub version retains:

unique page titles

meta descriptions

canonical URLs where appropriate

Open Graph metadata

semantic headings

robots.txt

sitemap.xml or a reliable sitemap implementation

structured data where appropriate

internal linking

clean URLs

Do not create fake SEO content or keyword stuffing.

9. PERFORMANCE

Before pushing:

remove unused dependencies

remove unnecessary files

optimize assets

avoid unnecessary JavaScript

ensure mobile responsiveness

ensure no horizontal scrolling

ensure calculators work on low-end Android devices

fix console errors

fix broken links

fix obvious accessibility problems

10. FUNCTIONAL TEST

Before committing, verify that:

homepage loads

navigation works

search works

all implemented tools work

calculations return valid results

invalid input is handled

reset buttons work

copy buttons work

mobile layout works

legal pages work

404 page works

all routes work

production build succeeds

There must be no visible:

NaN undefined Infinity broken images dead buttons placeholder lorem ipsum fake functionality

If a feature cannot reliably work in this MVP, label it Coming Soon rather than pretending it works.

11. GIT REPOSITORY

Create or connect to the GitHub repository for this project.

Recommended repository name:

alltools

Use a clean repository structure.

Make the initial commit meaningful, for example:

Initial production-ready AllTools MVP

Do not commit build artifacts such as unnecessary local caches or node_modules.

12. README

Create a professional README.md containing:

AllTools

Useful tools. Simple answers. Free.

Include:

project description

technology stack

local development instructions

build instructions

deployment instructions

required environment variables

Netlify deployment notes

SEO notes

AdSense integration notes

current tool list

known limitations

future improvements

13. FINAL RESPONSE

After completing the GitHub export, tell me:

GitHub repository name

Whether the complete source code was pushed

Commit name

Whether the production build succeeds

Whether Netlify deployment should work

Any environment variables I must configure

Any remaining errors or limitations

Most importantly:

Do not stop at creating a GitHub connection.

Actually push the complete source code and verify that the repository contains the application.

The final goal is:

LOVABLE ↓ GITHUB ↓ NETLIFY ↓ CUSTOM DOMAIN

I want to own the source code and be able to deploy AllTools independently from Lovable.

Proceed with the GitHub export now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aa66106f-6c8c-45bb-9963-ffeacd91219e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
