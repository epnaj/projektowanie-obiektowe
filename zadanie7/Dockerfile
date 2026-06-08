FROM swift:5.9

WORKDIR /app

COPY . .

RUN swift build -c release

EXPOSE 8000

CMD [ ".build/release/App" ]
