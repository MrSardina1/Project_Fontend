import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'imagePath',
    standalone: true
})
export class ImagePathPipe implements PipeTransform {
    private readonly baseUrl = 'http://localhost:3000/';

    transform(value: string | undefined | null): string {
        if (!value) {
            return '/assets/default-profile.png';
        }

        // If it's already a full URL or data URI, return it as is
        if (value.startsWith('http') || value.startsWith('data:')) {
            return value;
        }

        // Normalize path: remove leading slashes and any existing 'uploads/' prefix to avoid duplication
        let cleanPath = value.startsWith('/') ? value.substring(1) : value;
        if (cleanPath.startsWith('uploads/')) {
            cleanPath = cleanPath.substring(8);
        }

        // Always prepend /uploads/ because that's our serveRoot
        return this.baseUrl + 'uploads/' + cleanPath;
    }
}
