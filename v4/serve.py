#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Podgląd v4 z nagłówkami no-cache — żeby telefon nie trzymał starych plików.
Uruchom: python3 serve.py [port]"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {'.html': 'text/html; charset=utf-8',
                      '.css': 'text/css; charset=utf-8',
                      '.js': 'application/javascript; charset=utf-8',
                      '.svg': 'image/svg+xml',
                      '.png': 'image/png',
                      '.jpg': 'image/jpeg',
                      '.jpeg': 'image/jpeg',
                      '': 'application/octet-stream'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):
        print(fmt % args, flush=True)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    with Server(('0.0.0.0', PORT), Handler) as httpd:
        print(f'Podgląd v4 na porcie {PORT} (no-cache)', flush=True)
        httpd.serve_forever()
