FROM kprzystalski/projobj-php:latest

USER root

WORKDIR /app

COPY . /app/

RUN rm -f composer.lock && composer update --no-interaction --optimize-autoloader

RUN mkdir -p var \
    && php bin/console doctrine:schema:update --force --no-interaction

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
