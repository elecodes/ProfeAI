# 🔊 Voice Quality Guide — TTS Provider Stack

> **Last updated**: 2026-04-23

## Current TTS Architecture

ProfeAI uses a **cascading fallback** strategy for Text-to-Speech:

```
ElevenLabs (premium) → Amazon Polly (neural) → Google Cloud TTS → Web Speech API (browser)
```

The system tries each provider in order. If one fails (quota, network, etc.), it falls back to the next.

## Amazon Polly Voice Configuration (Primary Fallback)

Since ElevenLabs often exceeds its free-tier quota, **Amazon Polly** is the de facto primary TTS provider.

### Spanish (`es-ES`) Voice Matrix

| Voice     | Engine     | Gender | Status                        |
|-----------|------------|--------|-------------------------------|
| **Sergio**| `neural`   | Male   | ✅ Active — primary male voice |
| **Lucía** | `neural`   | Female | ✅ Active — primary female     |
| Enrique   | `standard` | Male   | ⛔ Do NOT use with neural     |
| Conchita  | `standard` | Female | Legacy, not configured        |
| Mía       | `standard` | Female | Legacy, not configured        |

> [!CAUTION]
> `Enrique` does NOT support the `neural` engine. Using `Enrique` + `neural` causes Polly to silently fail or produce incorrect audio. Always use `Sergio` for neural male Spanish voices. See [ADR 015](./adr/015-tts-male-voice-fix.md).

### Other Languages

| Language | Female Voice  | Male Voice    | Engine   |
|----------|---------------|---------------|----------|
| `en`     | Joanna        | Matthew       | neural   |
| `fr`     | Léa           | Mathieu       | standard |
| `de`     | Vicki         | Hans          | standard |
| `it`     | Bianca        | —             | standard |
| `pt`     | Camila        | —             | neural   |

## Gender Handling

Gender flows through the entire stack:

1. **Frontend** sends `options.gender` (`"male"` | `"female"`) in the TTS request body.
2. **Backend** (`tts.routes.ts`) passes it to `TTSService.generateSpeech()`.
3. **TTSService** selects the appropriate voice based on gender + language.
4. **Fallback**: If the primary call fails, `gender` is preserved in retries.

> [!WARNING]
> If fallback code passes `{}` instead of `{ gender: options?.gender }`, ALL voices default to female. This was a critical bug fixed in v1.2.7.

## ElevenLabs Configuration

| Gender | Voice ID                         |
|--------|----------------------------------|
| Female | `f9DFWr0Y8aHd6VNMEdTt`          |
| Male   | `N2lVS1wzXKqndCShpkY4`          |

Free tier: ~10,000 characters/month. Resets on the 1st.

## Web Speech API (Browser Fallback)

When all backend providers fail, the system falls back to the browser's built-in voices.

### Improving Browser Voice Quality

**Chrome/Edge**: Google voices are available automatically.

**Safari (Mac)**:
1. System Preferences → Accessibility → Spoken Content
2. Download premium voices: "Mónica" or "Jorge" (Spain) / "Paulina" (Mexico)

**Firefox**: Uses OS-level voices. Download system premium voices.

### Verify Available Voices

```javascript
speechSynthesis.getVoices().forEach(v =>
  console.log(`${v.name} (${v.lang})`)
);
```

## Debugging TTS Issues

1. **Check server logs** for `POLLY DEBUG` lines showing VoiceId and Engine.
2. **Compare audio files**: Different genders should produce different file sizes and MD5 hashes.
3. **Clear cache**: `rm -f cache/tts/*.mp3` — stale cache can serve wrong voices.
4. **Restart server**: `npx tsx` does NOT hot-reload; restart after code changes.
