# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot


snapshots = Snapshot()

snapshots['TestRenderDev.test_example_element 1'] = '''<div style="overflow: visible; margin-bottom: 300px;">
    <div id="circuits-vis-mock" style="margin: 15px 0; height: 900px; overflow: visible;"/>
    <script crossorigin type="module">
    import { render, Hello } from "https://unpkg.com/circuitsvis@1.0.0/dist/cdn/esm.js";
    render(
      "circuits-vis-mock",
      Hello,
      {"name": "Bob"}
    )
    </script>
    </div>'''
