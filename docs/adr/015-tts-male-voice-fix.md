# ADR 015: TTS Male Voice Fix (Polly Engine Compatibility)

## Status
Accepted

## Context
Male characters in dialogue roleplay (e.g., "Carlos", "Don José") were consistently speaking with a female voice. Investigation revealed two compounding bugs:

1. **Wrong Polly Voice Engine**: The Spanish male voice `Enrique` was configured with `Engine: "neural"`, but Enrique only supports the `"standard"` engine. When Polly received an unsupported engine/voice combination, the behavior was unpredictable — it silently fell back or produced audio from a different voice.

2. **Fallback Gender Loss**: In `tts.routes.ts`, the first fallback retry passed `{}` (empty options) to `TTSService.generateSpeech()`, which caused the gender to default to `"female"`. Any time the primary TTS call failed (e.g., ElevenLabs quota exceeded), ALL voices — including male — would regenerate as female.

### AWS Polly Spanish Voice Compatibility Matrix
| Voice     | Engine    | Gender | Notes                         |
|-----------|-----------|--------|-------------------------------|
| Lucía     | neural    | Female | ✅ Primary female voice        |
| Sergio    | neural    | Male   | ✅ Only neural-capable male    |
| Enrique   | standard  | Male   | ⚠️ Does NOT support neural    |
| Conchita  | standard  | Female | Legacy, not recommended       |
| Mía       | standard  | Female | Legacy, not recommended       |

## Decision

### 1. Voice Configuration Fix (`TTSService.ts`)
Replaced `Enrique` with `Sergio` as the Spanish male voice, since Sergio is the only `es-ES` male voice that supports the `neural` engine:

```typescript
es: {
  female: { Engine: "neural", VoiceId: "Lucia" },
  male:   { Engine: "neural", VoiceId: "Sergio" },  // was: Enrique (standard-only)
}
```

### 2. Fallback Gender Preservation (`tts.routes.ts`)
Changed the fallback retry to preserve the original gender option:

```diff
- result = await TTSService.generateSpeech(text, language, {});
+ result = await TTSService.generateSpeech(text, language, { gender: options?.gender });
```

### 3. Cache Invalidation
Cleared the entire TTS cache (`cache/tts/*.mp3`) to prevent stale female-voiced audio from being served for male characters.

### 4. Debug Logging
Added `POLLY DEBUG` logs that print `VoiceId`, `Engine`, and `gender` on every Polly call for future troubleshooting.

## Consequences
- **Correct Voice Differentiation**: Male and female characters now produce audibly distinct voices (verified via MD5 comparison of generated audio files).
- **Resilient Fallbacks**: Gender is preserved across all three fallback levels (ElevenLabs → Polly → Google).
- **Observable**: Debug logs make it immediately clear which voice and engine are being used in production.
- **Cache Awareness**: Developers must remember to clear `cache/tts/` when changing voice configurations, since the cache key includes gender but not VoiceId.
