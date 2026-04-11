FROM kprzystalski/projobj-php:latest

WORKDIR /app

COPY . /app/

RUN composer install --no-interaction --optimize-autoloader

RUN mkdir -p var \
    && php bin/console doctrine:schema:update --force --no-interaction

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
