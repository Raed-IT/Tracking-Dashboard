FROM php:8.4-fpm-alpine
RUN apk add --no-cache postgresql-dev linux-headers $PHPIZE_DEPS && docker-php-ext-install pdo_pgsql pcntl sockets && pecl install redis && docker-php-ext-enable redis && apk del $PHPIZE_DEPS linux-headers
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction
COPY backend .
RUN composer dump-autoload --optimize && chown -R www-data:www-data storage bootstrap/cache
CMD ["php-fpm"]
