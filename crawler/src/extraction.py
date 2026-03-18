"""3-Tier extraction engine for recipe extraction."""

import asyncio
import base64
import json
import logging
from dataclasses import dataclass, asdict
from typing import Any, Optional

import extruct
import httpx
from anthropic import Anthropic
from bs4 import BeautifulSoup

from .config import get_config

logger = logging.getLogger(__name__)


@dataclass
class Ingredient:
    """An ingredient in a recipe."""

    name: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    preparation: Optional[str] = None


@dataclass
class RecipeStep:
    """A step in recipe instructions."""

    step_number: int
    description: str
    techniques: Optional[list[str]] = None
    duration_minutes: Optional[int] = None


@dataclass
class ExtractedRecipe:
    """A recipe extracted from a URL."""

    title: str
    description: Optional[str] = None
    ingredients: list[Ingredient] = None
    instructions: list[RecipeStep] = None
    cuisine: Optional[str] = None
    difficulty: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    total_time_minutes: Optional[int] = None
    yield_quantity: Optional[str] = None
    yield_unit: Optional[str] = None
    serves: Optional[int] = None
    allergens: Optional[list[str]] = None
    dietary_tags: Optional[list[str]] = None
    source_url: Optional[str] = None
    extraction_confidence: float = 0.0
    raw_json: Optional[dict[str, Any]] = None

    def __post_init__(self):
        if self.ingredients is None:
            self.ingredients = []
        if self.instructions is None:
            self.instructions = []


class RecipeExtractor:
    """3-Tier extraction engine for recipes."""

    def __init__(self) -> None:
        """Initialize the extractor."""
        self.config = get_config()
        self.http_client = httpx.AsyncClient(
            timeout=self.config.extraction.timeout_seconds
        )
        self.claude_client = Anthropic(api_key=self.config.claude_api_key)

    async def extract(self, url: str, html: str) -> Optional[ExtractedRecipe]:
        """Try each extraction tier in order until successful.

        Args:
            url: Source URL of the recipe.
            html: HTML content of the page.

        Returns:
            ExtractedRecipe if successful, None otherwise.
        """
        logger.info(f"Starting extraction for {url}")

        # Tier 1: Structured data (JSON-LD, Microdata, RDFa)
        try:
            recipe = await self._tier1_structured_data(html, url)
            if recipe and recipe.extraction_confidence >= self.config.extraction.confidence_threshold:
                logger.info(f"Tier 1 extraction succeeded for {url}")
                return recipe
        except Exception as e:
            logger.debug(f"Tier 1 extraction failed: {e}")

        # Tier 2: LLM extraction from HTML
        try:
            recipe = await self._tier2_llm_extraction(html, url)
            if recipe and recipe.extraction_confidence >= self.config.extraction.confidence_threshold:
                logger.info(f"Tier 2 extraction succeeded for {url}")
                return recipe
        except Exception as e:
            logger.debug(f"Tier 2 extraction failed: {e}")

        # Tier 3: Vision OCR (screenshot + Claude Vision)
        try:
            recipe = await self._tier3_vision_ocr(url)
            if recipe and recipe.extraction_confidence >= self.config.extraction.confidence_threshold:
                logger.info(f"Tier 3 extraction succeeded for {url}")
                return recipe
        except Exception as e:
            logger.debug(f"Tier 3 extraction failed: {e}")

        logger.warning(f"All extraction tiers failed for {url}")
        return None

    async def _tier1_structured_data(self, html: str, url: str) -> Optional[ExtractedRecipe]:
        """Parse JSON-LD, Microdata, RDFa using extruct.

        Args:
            html: HTML content.
            url: Source URL.

        Returns:
            ExtractedRecipe if structured data is found and valid.
        """
        try:
            structured_data = extruct.extract(html, syntaxes=["json-ld", "microdata", "rdfa"])

            # Try JSON-LD first
            recipes = structured_data.get("json-ld", [])
            for item in recipes:
                if isinstance(item, dict):
                    if item.get("@type") == "Recipe" or "Recipe" in str(item.get("@type", "")):
                        return self._parse_structured_recipe(item, url, 0.9)

            # Try microdata
            recipes = structured_data.get("microdata", [])
            for item in recipes:
                if isinstance(item, dict):
                    if item.get("type") == ["http://schema.org/Recipe"]:
                        return self._parse_microdata_recipe(item, url, 0.85)

            logger.debug("No valid structured recipe data found")
            return None

        except Exception as e:
            logger.debug(f"Error parsing structured data: {e}")
            return None

    async def _tier2_llm_extraction(self, html: str, url: str) -> Optional[ExtractedRecipe]:
        """Send HTML to Claude for structured extraction.

        Args:
            html: HTML content.
            url: Source URL.

        Returns:
            ExtractedRecipe extracted by Claude.
        """
        try:
            # Limit HTML size to avoid token limits
            if len(html) > 100000:
                soup = BeautifulSoup(html, "html.parser")
                # Remove script and style tags
                for tag in soup(["script", "style"]):
                    tag.decompose()
                html = str(soup)[:100000]

            prompt = self._build_extraction_prompt(html)

            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}],
            )

            response_text = response.content[0].text

            # Extract JSON from response
            try:
                # Try to find JSON in the response
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                if start != -1 and end > start:
                    json_str = response_text[start:end]
                    recipe_data = json.loads(json_str)
                    return self._parse_llm_response(recipe_data, url, 0.75)
            except json.JSONDecodeError:
                logger.debug("Failed to parse Claude response as JSON")
                return None

        except Exception as e:
            logger.debug(f"Error in LLM extraction: {e}")
            return None

    async def _tier3_vision_ocr(self, url: str) -> Optional[ExtractedRecipe]:
        """Screenshot page and use Claude Vision to extract recipe.

        Args:
            url: Source URL.

        Returns:
            ExtractedRecipe extracted from screenshot.
        """
        try:
            # This would require Playwright integration
            # For now, return None as this requires browser automation
            logger.debug("Tier 3 Vision OCR requires Playwright setup")
            return None

        except Exception as e:
            logger.debug(f"Error in vision extraction: {e}")
            return None

    def _parse_structured_recipe(
        self, data: dict[str, Any], url: str, confidence: float
    ) -> ExtractedRecipe:
        """Parse JSON-LD structured recipe data.

        Args:
            data: Structured recipe data dict.
            url: Source URL.
            confidence: Extraction confidence score.

        Returns:
            ExtractedRecipe object.
        """
        ingredients: list[Ingredient] = []
        if "recipeIngredient" in data:
            for ing in data["recipeIngredient"]:
                if isinstance(ing, str):
                    ingredients.append(Ingredient(name=ing))
                elif isinstance(ing, dict):
                    ingredients.append(
                        Ingredient(
                            name=ing.get("name", ""),
                            quantity=float(ing.get("amount", 0)) if ing.get("amount") else None,
                            unit=ing.get("unitText"),
                        )
                    )

        instructions: list[RecipeStep] = []
        if "recipeInstructions" in data:
            instr = data["recipeInstructions"]
            if isinstance(instr, list):
                for idx, step in enumerate(instr, 1):
                    if isinstance(step, str):
                        instructions.append(RecipeStep(step_number=idx, description=step))
                    elif isinstance(step, dict):
                        instructions.append(
                            RecipeStep(
                                step_number=idx,
                                description=step.get("text", ""),
                            )
                        )

        # Parse time durations
        prep_time = self._parse_iso_duration(data.get("prepTime", ""))
        cook_time = self._parse_iso_duration(data.get("cookTime", ""))
        total_time = self._parse_iso_duration(data.get("totalTime", ""))

        return ExtractedRecipe(
            title=data.get("name", "Unknown Recipe"),
            description=data.get("description"),
            ingredients=ingredients,
            instructions=instructions,
            cuisine=data.get("recipeCuisine"),
            difficulty=data.get("recipeCategory"),
            prep_time_minutes=prep_time,
            cook_time_minutes=cook_time,
            total_time_minutes=total_time,
            serves=self._extract_number(data.get("recipeYield")),
            allergens=data.get("allergens", []),
            source_url=url,
            extraction_confidence=confidence,
            raw_json=data,
        )

    def _parse_microdata_recipe(
        self, data: dict[str, Any], url: str, confidence: float
    ) -> ExtractedRecipe:
        """Parse microdata structured recipe data.

        Args:
            data: Microdata recipe dict.
            url: Source URL.
            confidence: Extraction confidence score.

        Returns:
            ExtractedRecipe object.
        """
        properties = data.get("properties", {})
        ingredients: list[Ingredient] = []
        for ing in properties.get("recipeIngredient", []):
            ingredients.append(Ingredient(name=ing))

        instructions: list[RecipeStep] = []
        for idx, step in enumerate(properties.get("recipeInstructions", []), 1):
            instructions.append(RecipeStep(step_number=idx, description=step))

        return ExtractedRecipe(
            title=properties.get("name", ["Unknown Recipe"])[0],
            ingredients=ingredients,
            instructions=instructions,
            source_url=url,
            extraction_confidence=confidence,
            raw_json=data,
        )

    def _parse_llm_response(
        self, data: dict[str, Any], url: str, confidence: float
    ) -> ExtractedRecipe:
        """Parse Claude LLM extraction response.

        Args:
            data: Response data from Claude.
            url: Source URL.
            confidence: Extraction confidence score.

        Returns:
            ExtractedRecipe object.
        """
        ingredients: list[Ingredient] = []
        for ing in data.get("ingredients", []):
            if isinstance(ing, str):
                ingredients.append(Ingredient(name=ing))
            elif isinstance(ing, dict):
                ingredients.append(
                    Ingredient(
                        name=ing.get("name", ""),
                        quantity=ing.get("quantity"),
                        unit=ing.get("unit"),
                        preparation=ing.get("preparation"),
                    )
                )

        instructions: list[RecipeStep] = []
        for idx, step in enumerate(data.get("instructions", []), 1):
            if isinstance(step, str):
                instructions.append(RecipeStep(step_number=idx, description=step))
            elif isinstance(step, dict):
                instructions.append(
                    RecipeStep(
                        step_number=step.get("step_number", idx),
                        description=step.get("description", ""),
                        techniques=step.get("techniques"),
                        duration_minutes=step.get("duration_minutes"),
                    )
                )

        return ExtractedRecipe(
            title=data.get("title", "Unknown Recipe"),
            description=data.get("description"),
            ingredients=ingredients,
            instructions=instructions,
            cuisine=data.get("cuisine"),
            difficulty=data.get("difficulty"),
            prep_time_minutes=data.get("prep_time_minutes"),
            cook_time_minutes=data.get("cook_time_minutes"),
            total_time_minutes=data.get("total_time_minutes"),
            yield_quantity=data.get("yield_quantity"),
            yield_unit=data.get("yield_unit"),
            serves=data.get("serves"),
            allergens=data.get("allergens"),
            dietary_tags=data.get("dietary_tags"),
            source_url=url,
            extraction_confidence=confidence,
            raw_json=data,
        )

    def _build_extraction_prompt(self, html: str) -> str:
        """Build the extraction prompt for Claude.

        Args:
            html: HTML content to extract from.

        Returns:
            Prompt string.
        """
        return f"""Extract recipe information from this HTML content.
Return a JSON object with the following fields:
- title: Recipe name
- description: Short description
- ingredients: Array of objects with name, quantity, unit, preparation
- instructions: Array of objects with step_number, description, techniques (array), duration_minutes
- cuisine: Cuisine type
- difficulty: Difficulty level (Easy/Intermediate/Advanced/Professional)
- prep_time_minutes: Preparation time in minutes
- cook_time_minutes: Cooking time in minutes
- total_time_minutes: Total time in minutes
- serves: Number of servings
- yield_quantity: Yield amount
- yield_unit: Yield unit (servings, pieces, etc.)
- allergens: Array of allergens
- dietary_tags: Array of dietary tags

HTML Content:
{html[:50000]}

Return ONLY valid JSON, no other text."""

    def _parse_iso_duration(self, duration_str: str) -> Optional[int]:
        """Parse ISO 8601 duration string to minutes.

        Args:
            duration_str: ISO duration string like "PT1H30M".

        Returns:
            Duration in minutes or None.
        """
        if not duration_str:
            return None

        try:
            # Simple ISO 8601 parsing
            total_minutes = 0
            duration_str = duration_str.upper()

            if "PT" not in duration_str:
                return None

            time_part = duration_str.split("PT")[1]

            if "H" in time_part:
                hours = int(time_part.split("H")[0])
                total_minutes += hours * 60
                time_part = time_part.split("H")[1]

            if "M" in time_part:
                minutes = int(time_part.split("M")[0])
                total_minutes += minutes

            return total_minutes if total_minutes > 0 else None

        except (ValueError, IndexError):
            return None

    def _extract_number(self, value: Any) -> Optional[int]:
        """Extract a number from various formats.

        Args:
            value: Value to extract from.

        Returns:
            Integer or None.
        """
        if isinstance(value, int):
            return value
        if isinstance(value, str):
            try:
                return int(value.split()[0])
            except (ValueError, IndexError):
                return None
        if isinstance(value, list) and value:
            return self._extract_number(value[0])
        return None

    async def close(self) -> None:
        """Close HTTP connections."""
        await self.http_client.aclose()
