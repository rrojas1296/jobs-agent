FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends texlive-latex-base texlive-latex-recommended texlive-fonts-recommended lmodern poppler-utils python3 && rm -rf /var/lib/apt/lists/*
COPY extract-docx.py /opt/extract-docx.py
WORKDIR /work
ENV HOME=/tmp
USER 65534:65534
