# How TSDoc Works

**TSDoc** is a standard syntax for writing documentation comments *inside* your code. **TypeDoc** is the tool that reads those comments and generates the website.

It does **not** automatically write the comments for you. You have to add them yourself using the `/** ... */` format.

## The Process
1.  **You Write Comments**: You add descriptions to your functions, components, and types.
    ```typescript
    /**
     * This component displays a flashcard.
     * @param props - The props for the card.
     */
    export function Flashcard(props: FlashcardProps) { ... }
    ```
2.  **TypeDoc Reads Them**: When you run `npm run doc`, the tool scans your files.
3.  **Website Generated**: It creates the HTML site in `docs/api` based on what it found.

## Current Status
I have only annotated 3 files so far (`DialogueGenerator.ts`, `genkit.ts`, `SignInForm.tsx`). That is why you don't see descriptions for the others yet.

**I will now proceed to annotate the components you currently have open.**
