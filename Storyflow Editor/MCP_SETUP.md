# iOS Automated Debugging Setup Guide

## Status

- **XcodeBuildMCP**: Verified and Ready.
- **LLDB-MCP**: Repository cloned and dependencies installed. **Ready for Configuration**.

## Setup Complete
I have successfully set up the Python environment for you. You do **not** need to run any terminal commands.

## Antigravity Configuration

Add the following to your **Antigravity MCP Configuration** (`Agent Panel > ... > Manage MCP Servers > View raw config`).

Add the following to your **Antigravity MCP Configuration** (`Agent Panel > ... > Manage MCP Servers > View raw config`).

```json
{
  "mcpServers": {
    "XcodeBuildMCP": {
      "command": "npx",
      "args": [
        "-y",
        "xcodebuildmcp@latest"
      ],
      "env": {
        "INCREMENTAL_BUILDS_ENABLED": "true",
        "XCODEBUILDMCP_DYNAMIC_TOOLS": "false",
        "XCODEBUILDMCP_SENTRY_DISABLED": "true"
      }
    },
    "lldb-mcp": {
      "command": "/Users/daniel/Documents/Storyflow to Wildcard/Tools/lldb-mcp/.venv/bin/python",
      "args": [
        "/Users/daniel/Documents/Storyflow to Wildcard/Tools/lldb-mcp/lldb_mcp.py"
      ]
    }
  }
}
```

## Usage

- **Build**: Use `xcodebuildmcp` tools (e.g., build_project).
- **Debug**: Use `lldb-mcp` tools (e.g., lldb_start).

