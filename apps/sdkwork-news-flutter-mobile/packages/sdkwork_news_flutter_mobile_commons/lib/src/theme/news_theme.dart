import 'package:flutter/material.dart';

abstract final class NewsPalette {
  static const ink = Color(0xFF171B18);
  static const muted = Color(0xFF7A827C);
  static const canvas = Color(0xFFF4F5F2);
  static const surface = Color(0xFFFFFFFF);
  static const line = Color(0xFFE7EBE6);
  static const primary = Color(0xFFE63B2E);
  static const primaryDark = Color(0xFF7A1F18);
  static const primarySoft = Color(0xFFFFF0EE);
  static const danger = Color(0xFFC44F48);
  static const warning = Color(0xFFA36C21);
  static const blue = Color(0xFF286EA6);
  static const plum = Color(0xFF83536C);
}

abstract final class NewsTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: NewsPalette.primary,
      brightness: Brightness.light,
      surface: NewsPalette.surface,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme.copyWith(
        primary: NewsPalette.primary,
        onPrimary: Colors.white,
        surface: NewsPalette.surface,
        onSurface: NewsPalette.ink,
        outline: NewsPalette.line,
      ),
      scaffoldBackgroundColor: NewsPalette.canvas,
      fontFamilyFallback: const [
        'PingFang SC',
        'Microsoft YaHei',
        'sans-serif',
      ],
      appBarTheme: const AppBarTheme(
        backgroundColor: NewsPalette.surface,
        foregroundColor: NewsPalette.ink,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: NewsPalette.ink,
          fontSize: 20,
          fontWeight: FontWeight.w700,
        ),
      ),
      cardTheme: const CardThemeData(
        color: NewsPalette.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          side: BorderSide(color: NewsPalette.line),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 66,
        backgroundColor: NewsPalette.surface,
        indicatorColor: NewsPalette.primarySoft,
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 11,
            fontWeight:
                states.contains(WidgetState.selected) ? FontWeight.w700 : null,
            color: states.contains(WidgetState.selected)
                ? NewsPalette.primary
                : NewsPalette.muted,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: NewsPalette.line,
        thickness: 1,
        space: 1,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: NewsPalette.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: NewsPalette.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: NewsPalette.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: NewsPalette.primary, width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 44),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(minimumSize: const Size(44, 44)),
      ),
    );
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFFF8A7E),
      brightness: Brightness.dark,
      surface: const Color(0xFF1B1F1C),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme.copyWith(
        primary: const Color(0xFFFF8A7E),
        onPrimary: const Color(0xFF4A0F0A),
        surface: const Color(0xFF1B1F1C),
        onSurface: const Color(0xFFE7ECE9),
        outline: const Color(0xFF3A4540),
      ),
      scaffoldBackgroundColor: const Color(0xFF111512),
      fontFamilyFallback: const [
        'PingFang SC',
        'Microsoft YaHei',
        'sans-serif',
      ],
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1B1F1C),
        foregroundColor: Color(0xFFE7ECE9),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: const CardThemeData(
        color: Color(0xFF1B1F1C),
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          side: BorderSide(color: Color(0xFF3A4540)),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        height: 66,
        backgroundColor: const Color(0xFF1B1F1C),
        indicatorColor: const Color(0xFF4B2622),
        surfaceTintColor: Colors.transparent,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 11,
            fontWeight:
                states.contains(WidgetState.selected) ? FontWeight.w700 : null,
            color: states.contains(WidgetState.selected)
                ? const Color(0xFFFF8A7E)
                : const Color(0xFFA7B2AC),
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF3A4540),
        thickness: 1,
        space: 1,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: Color(0xFF1B211E),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: Color(0xFF3A4540)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: Color(0xFF3A4540)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(6)),
          borderSide: BorderSide(color: Color(0xFF65C8A7), width: 1.4),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(48, 44),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(minimumSize: const Size(44, 44)),
      ),
    );
  }
}
