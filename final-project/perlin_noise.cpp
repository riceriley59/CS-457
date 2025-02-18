#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <random>

// Vector2 class to handle 2D vectors
class Vector2 {
public:
    double x, y;

    Vector2(double x, double y) : x(x), y(y) {}

    double dot(const Vector2& other) const {
        return x * other.x + y * other.y;
    }
};

// Shuffle function for permutation array
void Shuffle(std::vector<int>& arrayToShuffle) {
    std::random_device rd;
    std::mt19937 rng(rd());

    for (size_t i = arrayToShuffle.size() - 1; i > 0; --i) {
        std::uniform_int_distribution<size_t> dist(0, i - 1);
        size_t index = dist(rng);
        std::swap(arrayToShuffle[i], arrayToShuffle[index]);
    }
}

// Generate the permutation array
std::vector<int> MakePermutation() {
    std::vector<int> permutation(256);
    for (int i = 0; i < 256; ++i) {
        permutation[i] = i;
    }

    Shuffle(permutation);

    permutation.insert(permutation.end(), permutation.begin(), permutation.end());
    return permutation;
}

// Get the constant vector based on permutation value
Vector2 GetConstantVector(int v) {
    int h = v & 3;
    if (h == 0) return Vector2(1.0, 1.0);
    else if (h == 1) return Vector2(-1.0, 1.0);
    else if (h == 2) return Vector2(-1.0, -1.0);
    else return Vector2(1.0, -1.0);
}

// Fade function for smoothing
double Fade(double t) {
    return ((6 * t - 15) * t + 10) * t * t * t;
}

// Linear interpolation
double Lerp(double t, double a1, double a2) {
    return a1 + t * (a2 - a1);
}

// 2D Perlin Noise function
double Noise2D(double x, double y, const std::vector<int> Permutation) {

    int X = static_cast<int>(std::floor(x)) & 255;
    int Y = static_cast<int>(std::floor(y)) & 255;

    double xf = x - std::floor(x);
    double yf = y - std::floor(y);

    Vector2 topRight(xf - 1.0, yf - 1.0);
    Vector2 topLeft(xf, yf - 1.0);
    Vector2 bottomRight(xf - 1.0, yf);
    Vector2 bottomLeft(xf, yf);

    // Select a value from the permutation array for each corner
    int valueTopRight = Permutation[Permutation[X + 1] + Y + 1];
    int valueTopLeft = Permutation[Permutation[X] + Y + 1];
    int valueBottomRight = Permutation[Permutation[X + 1] + Y];
    int valueBottomLeft = Permutation[Permutation[X] + Y];

    double dotTopRight = topRight.dot(GetConstantVector(valueTopRight));
    double dotTopLeft = topLeft.dot(GetConstantVector(valueTopLeft));
    double dotBottomRight = bottomRight.dot(GetConstantVector(valueBottomRight));
    double dotBottomLeft = bottomLeft.dot(GetConstantVector(valueBottomLeft));

    double u = Fade(xf);
    double v = Fade(yf);

    return Lerp(u,
                Lerp(v, dotBottomLeft, dotTopLeft),
                Lerp(v, dotBottomRight, dotTopRight));
}

double FractalBrownianMotion(double x, double y, double amplitude, double frequency, int numOctaves, std::vector<int> Permutation) {
    double result = 0.0;

    for (int octave = 0; octave < numOctaves; ++octave) {
        double n = amplitude * Noise2D(x * frequency, y * frequency, Permutation);
        result += n;

        amplitude *= 0.5;   // Reduce amplitude
        frequency *= 2.0;   // Increase frequency
    }

    return result;
}

std::vector<std::vector<double> > GenerateFBMNoiseMap(int width, int height, double amplitude, double frequency, int numOctaves, double scale) {
    const std::vector<int> Permutation = MakePermutation();

    std::vector<std::vector<double> > noiseMap(height, std::vector<double>(width));
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            double value = FractalBrownianMotion(x * scale, y * scale, amplitude, frequency, numOctaves, Permutation);
            noiseMap[y][x] = (value + 1.0) / 2.0; // Normalize to [0, 1]
        }
    }
    return noiseMap;
}
