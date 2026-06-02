## Product Design

The platform is deterministically content-driven, at least in its first stage.

The markdown source structure contains two types of pages:

Topic

- dependencies (topics) - logseq links
- overview
- problems (OR references at the lowest level) - logseq links
- summary and key ideas

Problem

- topic - logseq link
- statement
- hints
- sketch
- model solution
- summary and key ideas

Note that the problem has no connection to the parent topic, leaving the door open for multiple topics sharing the same problem.

The platform will generate a static website from a folder of such pages.
It will render the markdown content as it is, with some special considerations:

- each bullet point is a page section
- problem links are a collapsible section with the problem statement as the title
- topic links are rendered as links to the corresponding topic pages
- hints, sketch, model solution and summary are collapsible/hidden sections under the problem page.

At a second stage, there will be a solution submission box for each problem with built-in AI validation (e.g. checking if the solution is correct, providing feedback, etc.). This will require a backend to handle the submissions and run the AI validation. The AI will not simply compare to the model solution, the whole idea is to support multiple solution approaches and provide useful feedback on attempts.

This also requires user-management, to persist user history/progress.
