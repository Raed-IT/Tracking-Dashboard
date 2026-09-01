FROM php:8.4-fpm

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /var/www


# ============================================================
# System dependencies
# ============================================================

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libzip-dev \
    libicu-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*


# ============================================================
# PHP extensions
# ============================================================

RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        pcntl \
        intl \
        zip \
        gd \
        opcache


# ============================================================
# Redis PHP extension
# ============================================================

RUN pecl install redis \
    && docker-php-ext-enable redis


# ============================================================
# Composer
# ============================================================

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer


# ============================================================
# Copy Laravel
# ============================================================

COPY . /var/www


# ============================================================
# Composer dependencies
# ============================================================

RUN composer install \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader


# ============================================================
# Permissions
# ============================================================

RUN mkdir -p \
        /var/www/storage/framework/cache \
        /var/www/storage/framework/sessions \
        /var/www/storage/framework/views \
        /var/www/storage/logs \
        /var/www/bootstrap/cache \
    && chown -R www-data:www-data \
        /var/www/storage \
        /var/www/bootstrap/cache \
    && chmod -R 775 \
        /var/www/storage \
        /var/www/bootstrap/cache


EXPOSE 9000


CMD ["php-fpm"]