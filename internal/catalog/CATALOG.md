# Catalog

## Components

A component is a service, application, library, tool, website, or some other logical unit of software.

### Defining components

A component is defined by a file stored in a repository (usually alongside the component's source code). Sourcegraph searches for component definition files in the following locations:

- `sourcegraph.yaml` files in all repositories' default branches
- `.sourcegraph/*.component.yaml`

(In the future, this will be configurable to support multiple branches per repository.)

- **Source locations:** Where the code for this component lives, defined as a list of paths inside repositories. Paths may refer to the root (for the entire repository) or subpaths (for a specific directories inside the repository).

### Component ownership

A component can be owned by a person or a group.

### Permissions and security model

Permissions for components are based on permissions for repository of the component's first source location.

You have read access to a component if you have read access to the repository of the component's first source location. If you lack read access to the component's other source locations, then you will only see partial information about the component (and an alert will tell you that).

### Labels

Each component has labels, which are key-value metadata pairs that you can use to filter and group components. Labels can be applied manually (in the component definition) or dynamically (based on criteria you specify).

#### Well-known labels

<!-- TODO(sqs): lifecycle, kind -->

## Scorecards

Scorecards help you define and enforce standards for security, quality, and maturity.

## With other features

### Search

The new search keyword `in:` searches across both repositories and components. You should usually use `in:` instead of `repo:` or `component:`.

<!-- TODO(sqs): explain exactly how `in:` works, esp. how it interacts with a repository that has multiple components and some disconnected files. -->

- `in:<name-pattern>` limits a search to repositories and components whose name matches the pattern (example: `in:client` to search in the `client-web` component and `github.com/example/api-client` repository).
- `in:*<tag|label>` limits a search to repositories and components with the named tag or label (example: `in:*ui` to search in all components tagged `ui`).
- `in:*<label>=<value>` limits a search to repositories and components with the given label value (example: `in:*lang=go file:README.md` to search README.md files in components written in Go).

All of the existing `repo:` syntax also works for `in:` and `component:`.

### Repositories

Components and repositories are 2 different ways to view your code and understand the overall system.

When a repository or tree contains a single component, the page will show the component information. To view it without the component information, choose **View as tree** or **View as repository**.

When a repository or tree contains multiple components, the page will list the components.

When viewing a repository or tree, you can easily define a component using suggested YAML.

### Batch Changes

You can run a batch change across specific components first.

## TODOs

Data model:
- What about repositories/paths/files that are not in any component? If scorecards or health checks are treated as authoritative, there is a risk that problems in these "disconnected" repositories/paths/files will be missed and neglected.


Component discovery:
- Among what repositories should Sourcegraph search for my components?
- Is there a risk that 3rd-party repositories in my "working set" would define components that I would not want to be intermingled with my own components?

## NOTES

## Unify repositories, trees, and components

Every repository is a tree. Every tree is a possible component that hasn't yet been explicitly defined.

- First, fix the conceptual problem where some repo things are scoped to a rev and some aren't.
- Authors, usage, code owners, who-knows, dependencies, and API: these all would make sense scoped to a tree as well.

What does defining a component gain you? Why not just use the implicit component treatment of every tree?

- A name and other metadata associated with it
- Presence and searchability in a list of "components"
- Ability to scope searches to it with `in:<name>`
- Ability to define usage patterns and scorecards/policy
- Ability to upload data (deps, annotations, etc.) and have rich API integrations with it
- It's shown with a better UI for components rather than just the file/dir-centric tree view
- It has component owners associated with it

What is the default behavior of a repository that hasn't been defined as a component?
- It's surfaced as a possible component in "component discovery" (or, if it's a monorepo with multiple subprojects, then each subproject is surfaced as one). Until then, it's just a repository.
- OR...to help bring us into a world where monorepos and manyrepos are treated alike, all repositories are treated as components? TODO: Should there be a `union Project = Repository | Component`? (I think this is right.) And then since "every tree is a potential project", `union ThingThatCanShowAuthorsUsageCodeOwnersWhoKnowsDependenciesAPI = Repository | Component | Tree`.

## DEV

``` shell
# Get sample repos.
SRC_ACCESS_TOKEN= SRC_ENDPOINT=https://sourcegraph.com src search -json 'repo:github.com/sourcegraph/ f:package.json fork:no select:repo count:50' | jq '.Results[].name'
```

