# Interaction: advanced markdown blocks

This interaction demonstrates full advanced extraction for complex markdown navigation and validation.

`blockOrder(...)` is used here to make block progression deterministic while still allowing unlisted block types (`allowUnlisted: true`) that are also validated explicitly.

## Input Markdown

```md
## 9. ADVANCED BLOCK

Incident response summary links to [Design Spec](https://example.com/spec "Spec").

Evidence links must remain auditable across quarterly reviews.[^note]

This paragraph includes inline <span>risk annotations</span> for analysts.

Reference material remains available in [Quick Checklist][checklist] and <https://example.com/status>.

![Architecture](https://example.com/architecture.png "Pipeline")

| Metric | Target |
| --- | --- |
| Precision | >= 0.92 |

> Feature freshness sets the upper bound for decision quality.

~~~ts
const pipeline = ['ingestion', 'scoring', 'policy']
~~~

1. Validate signal quality
2. Re-run calibration
   - Compare previous threshold
   - Document incident delta

- [x] Baseline dashboard published
- [ ] Escalation policy approved

<div class="note">HTML block example for advanced parsing</div>

[^note]: Footnote used to validate advanced extraction.

[checklist]: https://example.com/checklist "Quick Checklist"
```


