# User tutorials

This guide explains how users can publish their own [tutorials](/writing-docs/tutorials) for the MakeCode editor.

There are 2 ways of sharing a tutorial: use a shared script or publish it in a [GitHub](https://github.com) repository.

## ~ hint

#### Custom tutorial example

For a quick introduction on writing and sharing a user tutorial, see this video:

https://youtu.be/lZucrzDgoIE

## ~

## Authoring

Author the tutorial content in the **README.md** file in your project. The format is the same as what's documented in [tutorials](/writing-docs/tutorials). 

The dependencies are used when starting the tutorial project, but code content (``main.blocks``, ``main.ts``) is ignored.

### ~ hint

#### Edit README.md

You can access ``README.md`` in the editor. Switch to **JavaScript**, go to **Explorer**, and then click on **README.md**.

### ~

## Share

The easiest way to share a tutorial is to first share the program. Then, use the shared project url combined with editor url and the ``#tutorial:`` specifier.

    https://[editor url]/#tutorial:[shared project url]

* where ``editor url`` is the editor dmain, like ``makecode.microbit.org``
* where ``shared project url`` is the url give to you by MakeCode after sharing, ``https://makecode.com/_somefunnyletters``.

The complete shared url is formatted like:

    https://makecode.microbit.org/#tutorial:https://makecode.com/_sIty7Iop

## GitHub repository

If you plan to update your tutorial over time, we recommend storing your project in a GitHub repository. With a repository, the URL to open the tutorial takes the full GitHub repository URL:

    https://[editor url]/#tutorial:[GitHub repository url]

### Multiple tutorials per repository

You can override the markdown file from the project used for the content of the tutorial (default is ``README.md``) by adding the path to the query argument (``.md`` not needed)

    https://[editor url]/#tutorial:[GitHub repository url]/[filename]

where MakeCode will load the ``filename.md`` file from the project. Don't forget to add this file in the
``files`` list in ``pxt.json``.

### Localization

Localized copies of the tutorial can be added to a subfolder ``_locales/[isocode]/[filename].md`` 
where ``filename`` is the name of the tutorial in the default locale. ``icocode`` can be the 
region specific language code or language neutral. MakeCode will pick the best match.

### Repository as extension

If the tutorial repository contains JavaScript files (``.ts``),
it will automatically be added to the dependencies of the 
program used during the tutorial. This allows you to package custom blocks
in your tutorials or teach your extensions via tutorials.

## Report abuse and approvals

By default, all tutorials opened from a user shared project or GitHub repository will have a **Report Abuse** button. If you would rather not have this button appear, use the GitHub project approach and get the repository approved.