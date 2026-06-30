# Playground

The playground runs as a dedicated Next.js application and can be embedded inside docs with preloaded `markdown` and `schema`.

Local app URL:

- [`https://playground.markschema.com`](https://playground.markschema.com)

Run it with:

```bash
npm run --workspace @markschema/playground dev
```

Embedded example (preloaded and ready to execute):

<div
  style="width: 100%; height: 760px; min-height: 420px; resize: vertical; overflow: auto; border: 1px solid var(--vp-c-divider); border-radius: 10px;"
>
  <iframe
    src="https://playground.markschema.com/?title=Quick%20Demo&view=schema&autoValidate=1&markdown64=IyBRdWljayBEZW1vCgojIyBQcm9maWxlCgotIE5hbWU6IEFkYSBMb3ZlbGFjZQotIFJvbGU6IEVuZ2luZWVyCg&schema64=aW1wb3J0IHsgbWQgfSBmcm9tICdAbWFya3NjaGVtYS9tZHNoYXBlJwoKY29uc3Qgc2NoZW1hID0gbWQuZG9jdW1lbnQoewogIHRpdGxlOiBtZC5oZWFkaW5nKDEpLAogIHByb2ZpbGU6IG1kLnNlY3Rpb24oJ1Byb2ZpbGUnKS5maWVsZHMoewogICAgTmFtZTogbWQuc3RyaW5nKCksCiAgICBSb2xlOiBtZC5zdHJpbmcoKSwKICB9KSwKfSkK"
    style="width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

Resize tip: drag the bottom edge/corner of the container to increase visible area.

Supported URL params:

- `title`
- `view=preview|schema`
- `autoValidate=1|0` (or `true|false`)
- `markdown` or `markdown64`
- `schema` or `schema64`
