import 'package:flutter_test/flutter_test.dart';
import 'package:sdkwork_news_flutter_mobile_comments/sdkwork_news_flutter_mobile_comments.dart';

void main() {
  test('comments controller loads, submits, likes, and pages', () async {
    final controller = NewsCommentsController(
      DemoNewsCommentsRepository(),
      articleId: 'article-1',
      articleTitle: '测试资讯',
    );
    await controller.initialize();

    expect(controller.comments, hasLength(3));
    expect(controller.summary?.publishedCount, 3);

    final submitted = await controller.submit('新的判断');
    expect(submitted, isTrue);
    expect(controller.comments.first.body, '新的判断');
    expect(controller.summary?.publishedCount, 4);

    final original = controller.comments[1];
    await controller.toggleLike(original.id);
    final liked = controller.comments.firstWhere((item) => item.id == original.id);
    expect(liked.viewerLiked, !original.viewerLiked);

    controller.dispose();
  });

  test('comments controller isolates pages by article', () async {
    final first = NewsCommentsController(
      DemoNewsCommentsRepository(),
      articleId: 'article-a',
    );
    final second = NewsCommentsController(
      DemoNewsCommentsRepository(),
      articleId: 'article-b',
    );
    await first.initialize();
    await second.initialize();
    await first.submit('only for article a');

    expect(
      first.comments.any((comment) => comment.body == 'only for article a'),
      isTrue,
    );
    expect(
      second.comments.any((comment) => comment.body == 'only for article a'),
      isFalse,
    );

    first.dispose();
    second.dispose();
  });
}
